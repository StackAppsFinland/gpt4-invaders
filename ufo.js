export class UFO {
    constructor(image, x, y, speed, direction, ctx) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.direction = direction;
        this.width = image.width / 1.5;
        this.height = image.height / 1.5;
        this.ctx = ctx;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x += this.speed * this.direction;
    }

    collision(projectile) {
        return projectile.x + projectile.width >= this.x &&
            projectile.x <= this.x + this.width &&
            projectile.y <= this.y + this.height &&
            projectile.y + projectile.height >= this.y;
    }
}
