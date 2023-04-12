export class ParticleExplosion {
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
            const randomizeSpeed = 0.01 + Math.random() * this.speed;
            const vx = Math.cos(angle) * randomizeSpeed;
            const vy = Math.sin(angle) * randomizeSpeed;
            const particle = {
                x: this.x,
                y: this.y,
                vx: vx,
                vy: vy,
                size: Math.random() * 5,
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
            particle.alpha -= this.alphaSpeed;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.fillStyle = Math.random() < 0.5 ? 'white' : 'orange';
            ctx.globalAlpha = Math.max(particle.alpha, 0);
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    isDone() {
        return this.timer >= this.duration;
    }
}