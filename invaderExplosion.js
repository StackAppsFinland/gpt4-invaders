export class InvaderExplosion {
    constructor(x, y, radius, numParticles) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.numParticles = numParticles;
        this.particles = this.createParticles();
        this.timer = 0;
        this.duration = 300;
    }

    createParticles() {
        const particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.01 + Math.random() * 0.6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
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
            particle.alpha -= 0.001;
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