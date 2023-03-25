export class ParticleExplosion {
    constructor(x, y, numParticles, duration) {
        this.x = x;
        this.y = y;
        this.numParticles = numParticles;
        this.particles = this.createParticles();
        this.timer = 0;
        this.duration = duration;
    }

    createParticles() {
        const particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.01 + Math.random() * 3.0;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
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
            particle.alpha -= 0.06;
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