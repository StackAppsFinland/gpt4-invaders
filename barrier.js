export class Barrier {
    constructor(x, y, blockSize, blockCountX, blockCountY) {
        this.x = x;
        this.y = y;
        this.blockSize = blockSize;
        this.blockCountX = blockCountX;
        this.blockCountY = blockCountY;
        this.barrierRight = this.x + this.blockSize * this.blockCountX;
        this.barrierBottom = this.y + this.blockSize * this.blockCountY;
        this.blocks = this.createBlocks();
    }

    createBlocks() {
        const blocks = [];
        for (let i = 0; i < this.blockCountX; i++) {
            blocks[i] = [];
            for (let j = 0; j < this.blockCountY; j++) {
                const blockX = this.x + i * this.blockSize;
                const blockY = this.y + j * this.blockSize;
                const blockRight = blockX + this.blockSize;
                const blockBottom = blockY + this.blockSize;

                // Calculate the percentage of removed blocks
                const remove60Percent = Math.ceil(this.blockCountX * 0.6 / 2);
                const remove40Percent = Math.ceil(this.blockCountX * 0.4 / 2);
                const removeRow3Percent = Math.ceil(this.blockCountX * 0.1);
                const removeRow2Percent = Math.ceil(this.blockCountX * 0.03);
                const removeRow1Percent = Math.ceil(this.blockCountX * 0.025);

                const visible = !(
                    (i >= (this.blockCountX / 2) - remove60Percent && i < (this.blockCountX / 2) + remove60Percent && (j === this.blockCountY - 1 || j === this.blockCountY - 2)) ||
                    (i >= (this.blockCountX / 2) - remove40Percent && i < (this.blockCountX / 2) + remove40Percent && j === this.blockCountY - 3) ||
                    (j < removeRow3Percent && (i === 0 || i === this.blockCountX - 1)) ||
                    (j < removeRow2Percent && (i === 1 || i === this.blockCountX - 2)) ||
                    (j < removeRow1Percent && (i === 2 || i === this.blockCountX - 3))
                );

                blocks[i][j] = {
                    x: blockX,
                    y: blockY,
                    width: this.blockSize,
                    height: this.blockSize,
                    right: blockRight,
                    bottom: blockBottom,
                    visible: visible
                };
            }
        }
        return blocks;
    }

    draw(ctx) {
        ctx.fillStyle = 'green';
        for (let i = 0; i < this.blockCountX; i++) {
            for (let j = 0; j < this.blockCountY; j++) {
                const block = this.blocks[i][j];
                if (block.visible) {
                    ctx.fillRect(block.x, block.y, block.width, block.height);
                }
            }
        }
    }

    isProjectileInBounds(rect) {
        return rect.x + rect.width > this.x &&
            rect.x < this.barrierRight &&
            rect.y + rect.height > this.y &&
            rect.y < this.barrierBottom;
    }

    collisionDetection(rect) {
        if (rect) {
            if (!this.isProjectileInBounds(rect)) return false
            for (let i = 0; i < this.blockCountX; i++) {
                for (let j = 0; j < this.blockCountY; j++) {
                    const block = this.blocks[i][j];
                    if (block.visible &&
                        rect.x < block.x + block.width &&
                        rect.x + rect.width > block.x &&
                        rect.y < block.y + block.height &&
                        rect.y + rect.height > block.y) {
                        this.explodeBlocks(i, j, false);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    collisionDetectionByInvader(rect) {
        if (rect) {
            for (let i = 0; i < this.blockCountX; i++) {
                for (let j = 0; j < this.blockCountY; j++) {
                    const block = this.blocks[i][j];
                    if (block.visible &&
                        rect.x < block.x + block.width &&
                        rect.x + rect.width > block.x &&
                        rect.y < block.y + block.height &&
                        rect.y + rect.height > block.y) {
                        this.explodeBlocks(i, j, true);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    explodeBlocks(blockX, blockY, isInvader) {
        // Remove the matching block
        let amount = isInvader ? 200 : 30;
        let radiusAmount = isInvader ? 10 : 5;


        this.blocks[blockX][blockY].visible = false;

        // Define a helper function to remove blocks with a given probability
        const hideBlocks = (x, y) => {
            if (this.blocks[x] && this.blocks[x][y] && this.blocks[x][y].visible) {
                this.blocks[x][y].visible = false;
            }
        };

        // Iterate through radii 1 to 5
        for (let radius = 0; radius <= radiusAmount; radius++) {
            // Remove 5 random blocks for the current radius
            for (let i = 0; i < amount + (radius * 2); i++) {
                // Calculate a random angle and use the current radius as distance
                const angle = Math.random() * 2 * Math.PI;

                // Calculate the block coordinates using polar coordinates
                const x = blockX + Math.round(radius * Math.cos(angle));
                const y = blockY + Math.round(radius * Math.sin(angle));

                hideBlocks(x, y);
            }
        }
    }
}
