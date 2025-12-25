/**
 * Particle System for Entropy Visualization
 * Renders visual feedback during entropy collection
 * 
 * @module components/particle-system
 */

/**
 * Individual particle entity
 */
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.size = options.size || Math.random() * 4 + 2;
        this.speedX = options.speedX || (Math.random() - 0.5) * 3;
        this.speedY = options.speedY || (Math.random() - 0.5) * 3;
        this.life = options.life || 80;
        this.maxLife = this.life;
        this.decay = options.decay || 0.97;
        this.color = options.color || this._generateColor();
        this.type = options.type || 'default';
    }

    _generateColor() {
        // Golden/amber magical hues
        const hue = Math.random() * 60 + 20; // 20-80 (amber to gold)
        const saturation = 70 + Math.random() * 20;
        const lightness = 50 + Math.random() * 20;
        return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.size *= this.decay;

        // Slow down over time
        this.speedX *= 0.98;
        this.speedY *= 0.98;
    }

    draw(ctx) {
        const alpha = (this.life / this.maxLife) * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();

        if (this.type === 'star') {
            this._drawStar(ctx);
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }

        ctx.fill();
        ctx.restore();
    }

    _drawStar(ctx) {
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2;

        ctx.moveTo(this.x, this.y - outerRadius);
        for (let i = 0; i < spikes; i++) {
            const rot = (Math.PI / 2 * 3) + (i * Math.PI * 2 / spikes);
            ctx.lineTo(
                this.x + Math.cos(rot) * outerRadius,
                this.y + Math.sin(rot) * outerRadius
            );
            const innerRot = rot + Math.PI / spikes;
            ctx.lineTo(
                this.x + Math.cos(innerRot) * innerRadius,
                this.y + Math.sin(innerRot) * innerRadius
            );
        }
        ctx.closePath();
    }

    isDead() {
        return this.life <= 0 || this.size < 0.5;
    }
}

/**
 * Particle system manager
 */
export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;

        this._resize();
        window.addEventListener('resize', this._resize.bind(this));
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Spawn particles at a location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} options - Particle options
     */
    spawn(x, y, count = 3, options = {}) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, {
                ...options,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4
            });
            this.particles.push(particle);
        }

        // Limit particle count for performance
        if (this.particles.length > 500) {
            this.particles = this.particles.slice(-400);
        }
    }

    /**
     * Spawn burst of particles (for special events)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    burst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 3 + Math.random() * 2;

            this.particles.push(new Particle(x, y, {
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                life: 60 + Math.random() * 40,
                type: Math.random() > 0.7 ? 'star' : 'default'
            }));
        }
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this._animate();
    }

    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _animate() {
        if (!this.isRunning) return;

        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }

        this.animationId = requestAnimationFrame(this._animate.bind(this));
    }

    /**
     * Get particle count
     * @returns {number}
     */
    getCount() {
        return this.particles.length;
    }
}
