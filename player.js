export class Player {
    constructor(x, y, width, height, image, ctx) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
        this.ctx = ctx;
        this.score = 0;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
