export class Projectile {
    constructor(x, y, width, height, ctx, velocityY) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.velocityY = velocityY;
    }
    
    update() {
        this.y += this.velocityY; // Modify this line
    }

    draw() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}