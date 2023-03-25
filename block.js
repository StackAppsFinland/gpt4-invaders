export class Block {
    constructor(x, y, width, height, color, context) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.ctx = context;
        this.hits = Array.from({ length: Math.ceil(height / 10) }, () => Array.from({ length: Math.ceil(width / 10) }, () => 0));
    }

    draw() {
        this.ctx.fillStyle = this.color;
        for (let i = 0; i < this.hits.length; i++) {
            for (let j = 0; j < this.hits[i].length; j++) {
                if (this.hits[i][j] < 6) {
                    this.ctx.fillRect(this.x + j * 10, this.y + i * 10, 10, 10);
                }
            }
        }
    }

    handleHit(projectileX, projectileY) {
        const relativeX = projectileX - this.x;
        const relativeY = projectileY - this.y;

        const col = Math.floor(relativeX / this.partWidth);
        const row = Math.floor(relativeY / this.partHeight);

        if (row >= 0 && row < this.parts.length && col >= 0 && col < this.parts[row].length) {
            this.parts[row][col] = 0;
            console.log("hit")
        }
    }

}
