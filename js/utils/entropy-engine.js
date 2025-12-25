/**
 * Enhanced Entropy Engine
 * Collects entropy from multiple user interaction sources
 * Inspired by Cloudflare's Lava Lamp entropy generation
 * 
 * @module utils/entropy-engine
 */

/**
 * EntropyPool - Collects and mixes entropy from various sources
 */
export class EntropyPool {
    constructor() {
        this.pool = new Uint32Array(16); // 512 bits of entropy
        this.poolIndex = 0;
        this.totalEntropy = 0;
        this.samples = [];
        this.lastTimestamp = 0;
        this.lastPosition = { x: 0, y: 0 };

        // Initialize with system entropy
        this._initializePool();
    }

    /**
     * Initialize pool with cryptographic random values
     * @private
     */
    _initializePool() {
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(this.pool);
        } else {
            // Fallback: use less secure but still varied initialization
            for (let i = 0; i < this.pool.length; i++) {
                this.pool[i] = Math.floor(Math.random() * 0xFFFFFFFF);
            }
        }
    }

    /**
     * Simple hash mixing function (xorshift-based)
     * @private
     * @param {number} value - Value to mix in
     */
    _mix(value) {
        const idx = this.poolIndex % this.pool.length;
        let x = this.pool[idx] ^ value;

        // xorshift32 mixing
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;

        this.pool[idx] = x >>> 0; // Ensure unsigned
        this.poolIndex++;
    }

    /**
     * Add entropy sample from user interaction
     * @param {string} source - Source type (mouse, touch, key, etc.)
     * @param {Object} data - Event data
     * @returns {number} Entropy bits contributed
     */
    addSample(source, data) {
        const now = performance.now();
        const timeDelta = now - this.lastTimestamp;
        this.lastTimestamp = now;

        // Calculate entropy contribution based on source
        let entropyBits = 0;

        switch (source) {
            case 'mouse':
            case 'touch': {
                const dx = Math.abs(data.x - this.lastPosition.x);
                const dy = Math.abs(data.y - this.lastPosition.y);
                const velocity = Math.sqrt(dx * dx + dy * dy);

                // Mix position data
                this._mix(Math.floor(data.x * 1000) ^ Math.floor(data.y * 1000));
                this._mix(Math.floor(velocity * 10000));
                this._mix(Math.floor(timeDelta * 1000000)); // Microsecond precision

                // Add crypto nonce
                if (window.crypto) {
                    const nonce = new Uint32Array(1);
                    window.crypto.getRandomValues(nonce);
                    this._mix(nonce[0]);
                }

                this.lastPosition = { x: data.x, y: data.y };

                // Entropy estimate: ~8-12 bits per movement event
                entropyBits = Math.min(12, Math.log2(velocity + 1) * 2 + 4);
                break;
            }

            case 'key': {
                this._mix(data.keyCode ^ (Math.floor(timeDelta * 1000) << 8));
                entropyBits = 4; // ~4 bits per keystroke
                break;
            }

            case 'click': {
                this._mix(Math.floor(data.x) ^ (Math.floor(data.y) << 16));
                this._mix(Math.floor(timeDelta * 1000000));
                entropyBits = 6;
                break;
            }

            case 'scroll': {
                this._mix(Math.floor(data.deltaY * 100) ^ Math.floor(timeDelta * 10000));
                entropyBits = 3;
                break;
            }

            case 'devicemotion': {
                const accel = data.acceleration || { x: 0, y: 0, z: 0 };
                this._mix(Math.floor((accel.x || 0) * 10000));
                this._mix(Math.floor((accel.y || 0) * 10000));
                this._mix(Math.floor((accel.z || 0) * 10000));
                entropyBits = 8; // Accelerometer data is highly entropic
                break;
            }

            default:
                this._mix(Math.floor(Math.random() * 0xFFFFFFFF));
                entropyBits = 1;
        }

        this.totalEntropy += entropyBits;

        this.samples.push({
            source,
            timestamp: now,
            entropyBits
        });

        return entropyBits;
    }

    /**
     * Get current entropy level as percentage
     * @param {number} targetBits - Target entropy bits (default 256)
     * @returns {number} Percentage (0-100)
     */
    getProgress(targetBits = 256) {
        return Math.min(100, (this.totalEntropy / targetBits) * 100);
    }

    /**
     * Check if sufficient entropy has been collected
     * @param {number} targetBits - Target entropy bits
     * @returns {boolean}
     */
    isReady(targetBits = 256) {
        return this.totalEntropy >= targetBits;
    }

    /**
     * Generate final seed from entropy pool
     * @returns {number} 32-bit seed value
     */
    generateSeed() {
        // Final mixing pass
        let seed = 0;
        for (let i = 0; i < this.pool.length; i++) {
            seed ^= this.pool[i];
            seed = (seed * 0x45d9f3b) >>> 0;
        }

        // Add final timestamp entropy
        seed ^= Math.floor(performance.now() * 1000000);

        return seed >>> 0;
    }

    /**
     * Reset the entropy pool
     */
    reset() {
        this._initializePool();
        this.poolIndex = 0;
        this.totalEntropy = 0;
        this.samples = [];
        this.lastTimestamp = 0;
        this.lastPosition = { x: 0, y: 0 };
    }

    /**
     * Get statistics about collected entropy
     * @returns {Object} Statistics object
     */
    getStats() {
        const sources = {};
        this.samples.forEach(s => {
            sources[s.source] = (sources[s.source] || 0) + s.entropyBits;
        });

        return {
            totalBits: this.totalEntropy,
            sampleCount: this.samples.length,
            sourceBreakdown: sources
        };
    }
}

/**
 * EntropyCollector - Manages event listeners and collection process
 */
export class EntropyCollector {
    constructor(options = {}) {
        this.pool = new EntropyPool();
        this.isCollecting = false;
        this.targetBits = options.targetBits || 256;
        this.onProgress = options.onProgress || (() => { });
        this.onComplete = options.onComplete || (() => { });
        this.onSample = options.onSample || (() => { });

        this._boundHandlers = {
            mouse: this._handleMouse.bind(this),
            touch: this._handleTouch.bind(this),
            key: this._handleKey.bind(this),
            click: this._handleClick.bind(this),
            scroll: this._handleScroll.bind(this),
            motion: this._handleDeviceMotion.bind(this)
        };
    }

    /**
     * Start collecting entropy
     */
    start() {
        if (this.isCollecting) return;

        this.isCollecting = true;
        this.pool.reset();

        // Attach event listeners
        document.addEventListener('mousemove', this._boundHandlers.mouse, { passive: true });
        document.addEventListener('touchmove', this._boundHandlers.touch, { passive: true });
        document.addEventListener('keydown', this._boundHandlers.key, { passive: true });
        document.addEventListener('click', this._boundHandlers.click, { passive: true });
        document.addEventListener('scroll', this._boundHandlers.scroll, { passive: true });

        // Device motion (mobile)
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', this._boundHandlers.motion, { passive: true });
        }
    }

    /**
     * Stop collecting entropy
     */
    stop() {
        if (!this.isCollecting) return;

        this.isCollecting = false;

        // Remove event listeners
        document.removeEventListener('mousemove', this._boundHandlers.mouse);
        document.removeEventListener('touchmove', this._boundHandlers.touch);
        document.removeEventListener('keydown', this._boundHandlers.key);
        document.removeEventListener('click', this._boundHandlers.click);
        document.removeEventListener('scroll', this._boundHandlers.scroll);

        if (window.DeviceMotionEvent) {
            window.removeEventListener('devicemotion', this._boundHandlers.motion);
        }
    }

    _handleMouse(e) {
        this._processEvent('mouse', { x: e.clientX, y: e.clientY });
    }

    _handleTouch(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this._processEvent('touch', { x: touch.clientX, y: touch.clientY });
        }
    }

    _handleKey(e) {
        this._processEvent('key', { keyCode: e.keyCode });
    }

    _handleClick(e) {
        this._processEvent('click', { x: e.clientX, y: e.clientY });
    }

    _handleScroll(e) {
        this._processEvent('scroll', { deltaY: window.scrollY });
    }

    _handleDeviceMotion(e) {
        this._processEvent('devicemotion', { acceleration: e.acceleration });
    }

    _processEvent(source, data) {
        if (!this.isCollecting) return;

        const bits = this.pool.addSample(source, data);
        const progress = this.pool.getProgress(this.targetBits);

        this.onSample({ source, data, bits, progress });
        this.onProgress(progress);

        if (this.pool.isReady(this.targetBits)) {
            this.stop();
            this.onComplete(this.pool.generateSeed());
        }
    }

    /**
     * Get the entropy pool
     * @returns {EntropyPool}
     */
    getPool() {
        return this.pool;
    }
}
