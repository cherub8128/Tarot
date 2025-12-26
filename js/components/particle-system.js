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
        this.effectType = options.effectType || 'star';
        this.size = options.size || Math.random() * 4 + 2;

        // Physics adjustments based on effect type
        if (this.effectType === 'ripple') {
            this.size = 1; // Starts small, grows
            this.maxSize = 30 + Math.random() * 20;
            this.speedX = 0;
            this.speedY = 0;
            this.life = 60;
        } else if (this.effectType === 'firework') {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.life = 40 + Math.random() * 20;
            this.gravity = 0.1;
        } else if (this.effectType === 'flower') {
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.2;
            this.life = 100 + Math.random() * 40;
        } else {
            // Star (default)
            this.speedX = options.speedX || (Math.random() - 0.5) * 3;
            this.speedY = options.speedY || (Math.random() - 0.5) * 3;
            this.life = options.life || 80;
        }

        this.maxLife = this.life;
        this.decay = options.decay || 0.97;
        this.color = options.color || this._generateColor();

        // Specific init for firework trail
        if (this.effectType === 'firework') {
            this.trail = [];
        }
    }

    _generateColor() {
        // Magical color palette with variety
        const palettes = [
            { h: [20, 60], s: [70, 90], l: [50, 70] },   // Gold/Amber
            { h: [260, 290], s: [60, 80], l: [50, 70] }, // Purple
            { h: [180, 200], s: [60, 80], l: [50, 70] }, // Cyan
            { h: [330, 350], s: [60, 80], l: [50, 70] }  // Rose
        ];
        const palette = palettes[Math.floor(Math.random() * palettes.length)];
        const hue = palette.h[0] + Math.random() * (palette.h[1] - palette.h[0]);
        const saturation = palette.s[0] + Math.random() * (palette.s[1] - palette.s[0]);
        const lightness = palette.l[0] + Math.random() * (palette.l[1] - palette.l[0]);
        return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`;
    }

    update() {
        if (this.effectType === 'ripple') {
            this.size += (this.maxSize - this.size) * 0.05;
            this.life--;
        } else if (this.effectType === 'firework') {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity; // Gravity
            this.speedX *= 0.95; // Air resistance
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.pop();
            this.life--;
        } else if (this.effectType === 'flower') {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spin;
            this.life--;
            this.speedX *= 0.98;
            this.speedY *= 0.98;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life--;
            this.size *= this.decay;
            this.speedX *= 0.98;
            this.speedY *= 0.98;
        }
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();

        if (this.effectType === 'ripple') {
            const alpha = (this.life / this.maxLife);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner ripple
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size * 0.6, this.size * 0.36, 0, 0, Math.PI * 2);
            ctx.stroke();

        } else if (this.effectType === 'firework') {
            const alpha = (this.life / this.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;

            // Draw trail
            ctx.beginPath();
            if (this.trail.length > 0) {
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let t of this.trail) ctx.lineTo(t.x, t.y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw spark
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.effectType === 'flower') {
            const alpha = (this.life / this.maxLife);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;

            // Draw Flower
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.ellipse(0, 5, 3, 8, (Math.PI * 2 * i) / 5, 0, Math.PI * 2);
            }
            ctx.fill();

            // Center dot
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Star (Default)
            const alpha = (this.life / this.maxLife);
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.random() * 0.1);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;

            // Glow
            if (this.life > 20) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            }

            this._drawStar(ctx);
        }

        ctx.restore();
    }

    _drawStar(ctx) {
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size / 2.5;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const a = (Math.PI * i) / spikes - Math.PI / 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
    }

    isDead() {
        return this.life <= 0 || (this.effectType !== 'ripple' && this.size < 0.5);
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

        this.currentEffect = 'star';

        this._resize();
        window.addEventListener('resize', this._resize.bind(this));
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    _getRandomEffect() {
        const effects = ['star', 'ripple', 'firework', 'flower'];
        return effects[Math.floor(Math.random() * effects.length)];
    }

    /**
     * Spawn particles at a location
     */
    spawn(x, y, count = 3, options = {}) {
        // Randomize effect for this spawn if not provided
        const effectType = options.effectType || this._getRandomEffect();

        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, {
                ...options,
                effectType: effectType
            });
            this.particles.push(particle);
        }

        if (this.particles.length > 500) {
            this.particles = this.particles.slice(-400);
        }
    }

    /**
     * Create spiral burst effect
     */
    spiralBurst(x, y, count = 40) {
        const effectType = this._getRandomEffect();
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 4 * i) / count;
            const speed = 2 + (i / count) * 5;
            const delay = i * 10;

            setTimeout(() => {
                this.particles.push(new Particle(x, y, {
                    speedX: Math.cos(angle) * speed,
                    speedY: Math.sin(angle) * speed,
                    size: 3 + Math.random() * 3,
                    life: 100,
                    effectType: effectType
                }));
            }, delay);
        }
    }

    /**
     * Create magic trail effect
     */
    magicTrail(x, y, intensity = 1) {
        // Occasionally switch global effect for variety
        if (Math.random() < 0.02) {
            this.currentEffect = this._getRandomEffect();
        }

        const count = Math.floor(3 * intensity);
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, {
                effectType: this.currentEffect,
                speedX: (Math.random() - 0.5) * 2,
                speedY: -1 - Math.random() * 2 // General upward float
            }));
        }
    }

    burst(x, y, count = 30) {
        const effectType = this._getRandomEffect();
        for (let i = 0; i < count; i++) {
            // Burst physics depends on effect type which is handled in Particle constructor
            const angle = (Math.PI * 2 * i) / count;
            const speed = 4 + Math.random() * 4;

            this.particles.push(new Particle(x, y, {
                effectType: effectType,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed
            }));
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this._animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

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

    getCount() {
        return this.particles.length;
    }
}
