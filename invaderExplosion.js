export class InvaderExplosion {
    constructor(x, y, numParticles, duration, speed, alphaSpeed) {
        this.x = x;
        this.y = y;
        this.numParticles = numParticles;
        this.timer = 0;
        this.duration = duration;
        this.speed = speed;
        this.alphaSpeed = alphaSpeed;
        this.particles = this.createParticles();
    }

    createParticles() {
        const particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const randomSpeed = 0.01 + Math.random() * this.speed;
            const vx = Math.cos(angle) * randomSpeed;
            const vy = Math.sin(angle) * randomSpeed;
            const particle = {
                x: this.x,
                y: this.y,
                vx: vx,
                vy: vy,
                width: 6 + Math.random() * 20,
                height: 6,
                rotation: angle,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                alpha: 1
            };
            particles.push(particle);
        }
        return particles;
    }

    update() {
        this.timer++;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.alpha -= this.alphaSpeed;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.fillStyle = 'white';
            ctx.globalAlpha = Math.max(particle.alpha, 0);
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
            ctx.restore();
        });
        ctx.globalAlpha = 1;
    }

    isDone() {
        return this.timer >= this.duration;
    }
}