export class Invader {
    constructor(x, y, width, height, image, altImage, ctx, col, invaderInColumns, scoreAmount) {
        this.x = x;
        this.y = y;
        this.width = width
        this.height = height
        this.image = image;
        this.originalImage = image;
        this.altImage = altImage;
        this.ctx = ctx;
        this.col = col;
        this.invadersInColumns = invaderInColumns;
        this.isAltImage = false;
        this.scoreAmount = scoreAmount;
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    swapImages() {
        this.isAltImage = !this.isAltImage;

        if (this.isAltImage) {
            this.image = this.altImage;
        } else {
            this.image = this.originalImage;
        }
    }

    removeFromColumns() {
        if (this.invadersInColumns[this.col]) {
            const index = this.invadersInColumns[this.col].indexOf(this);
            if (index > -1) {
                this.invadersInColumns[this.col].splice(index, 1);
            }
        }
    }
}