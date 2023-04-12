import {Player} from './player.js';
import {Projectile} from './projectile.js';
import {Invader} from './invader.js';
import {UFO} from './ufo.js';
import {Barrier} from './barrier.js';
import {ParticleExplosion} from './particleExplosion.js';
import {InvaderExplosion} from './invaderExplosion.js';
import {Sounds} from './sounds.js';

function invaders() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const keysPressed = {
        ArrowLeft: false,
        ArrowRight: false,
    };

    window.topMargin = 80;
    let greenLineBottom = 80;
    let gameStarted = false;
    let sounds;
    let swapDirection = false;
    let moveInvaderDown = false;
    let invaderMoveSpeed = 10.0;
    let moveDirection = 'right';
    let playerVisible = true;
    let lives = 3;
    let pauseGame = false;
    let ufoSoundPlayed = false;
    let ufo;
    let ufoOnScreen = false;
    let ufoInterval;
    let lowestInvaderYPos = 0;

    let playerProjectile = null;
    const leftRightMargin = 25.0;
    let invaderProjectiles = [];
    let barriers = [];
    let explosions = [];
    let calibrateSpeed = true;

    const playerImage = new Image();
    playerImage.src = 'images/glow_player.png';
    playerImage.width = 20;
    playerImage.height = 20;

    const blockSize = 3;
    const blockCountX = 35;
    const blockCountY = 24;

    const barrierMargin = (canvas.width - (blockSize * blockCountX) * 4 - 80 * 3) / 2;

    for (let i = 0; i < 4; i++) {
        const barrierX = barrierMargin + i * (blockSize * blockCountX + 80);
        const barrier = new Barrier(barrierX, 700, blockSize, blockCountX, blockCountY);
        barriers.push(barrier);
    }

    let playerWidth = 40;
    let playerHeight = 20;
    let player = new Player(canvas.width / 2 - (playerWidth / 2), canvas.height - greenLineBottom - playerHeight - 50,
        playerWidth, playerHeight, playerImage, ctx, canvas);
    let {invaders, invadersInColumns} = createInvaders(5, 11);

    const ufoImage = new Image();
    ufoImage.src = 'images/ufo.png';

    function drawGreenLine() {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - greenLineBottom);
        ctx.lineTo(canvas.width, canvas.height - greenLineBottom);
        ctx.stroke();
    }

    function isColliding(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    function createInvaders(rows, columns) {
        const invaders = [];
        const invaderSpacing = (canvas.width * 0.8 - leftRightMargin * (columns + 1)) / columns;
        const invadersInColumns = {};

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const x = leftRightMargin + col * (invaderSpacing + leftRightMargin) + 10;
                const y = row * (invaderSpacing + leftRightMargin) + 140;
                const invaderImage = new Image();
                const altInvaderImage = new Image();
                let invaderNumber = 2;
                let imageWidth = 26;
                let imageOffset = 0;
                let scoreAmount = 30;
                if (row > 0) {
                    invaderNumber = 1;
                    imageWidth = 38;
                    imageOffset = 6;
                    scoreAmount = 20;
                }
                if (row > 2) {
                    invaderNumber = 3;
                    imageWidth = 38;
                    imageOffset = 6;
                    scoreAmount = 10;
                }
                invaderImage.src = 'images/glow_invader' + invaderNumber + '_0.png';
                altInvaderImage.src = 'images/glow_invader' + invaderNumber + '_1.png';
                const invader = new Invader(
                    x - imageOffset,
                    y,
                    imageWidth,
                    28,
                    invaderImage,
                    altInvaderImage,
                    ctx,
                    col,
                    invadersInColumns,
                    scoreAmount
                );

                invaders.push(invader);
                if (!invadersInColumns[col]) {
                    invadersInColumns[col] = [];
                }
                invadersInColumns[col].push(invader);
            }
        }

        return {invaders, invadersInColumns};
    }

    function findBottomInvaders() {
        const bottomInvaders = [];
        for (const col in invadersInColumns) {
            const columnInvaders = invadersInColumns[col];
            let bottomInvader = null;
            for (const invader of columnInvaders) {
                if (!bottomInvader || invader.y > bottomInvader.y) {
                    bottomInvader = invader;
                }
            }
            if (bottomInvader) {
                if (bottomInvader.y + bottomInvader.height > lowestInvaderYPos) {
                    lowestInvaderYPos = bottomInvader.y + bottomInvader.height;
                }

                bottomInvaders.push(bottomInvader);
            }
        }
        return bottomInvaders.filter(invader => invaders.includes(invader));
    }

    function fireFromRandomInvader(bottomInvaders) {
        if (pauseGame) return

        if (bottomInvaders.length > 0) {
            const randomIndex = Math.floor(Math.random() * bottomInvaders.length);
            const invader = bottomInvaders[randomIndex];
            const projectile = new Projectile(
                invader.x + invader.width / 2 - 2,
                invader.y + invader.height,
                4,
                10,
                ctx,
                0.9  * speedMultiplier
            );
            invaderProjectiles.push(projectile);
        }
    }

    function moveInvaders(i) {
        let moveSpeed = invaderMoveSpeed;

        if (moveInvaderDown) moveSpeed = 10.0

        if (moveDirection === 'right' && invaders[i]) {
            invaders[i].x += moveSpeed;
        } else if (moveDirection === 'left' && invaders[i]) {
            invaders[i].x -= moveSpeed;
        }

        if (moveInvaderDown && invaders[i]) {
            invaders[i].y += 30.0;
        }

        if (invaders[i]) invaders[i].swapImages();
    }

    function handleKeyUp(event) {
        keysPressed[event.key] = false;
    }

    function handleKeyDown(event) {
        if (calibrateSpeed) return;

        if (!pauseGame) {
            if (event.key === ' ') {
                if (!playerProjectile) {
                    playerProjectile = new Projectile(player.x + player.width / 2 - 2, player.y, 4, 10, ctx, -3.0 * speedMultiplier);
                    sounds.playFiringSound()
                }
            } else {
                keysPressed[event.key] = true;
            }
        }
    }

    function calculateTimeout() {
        const baseTimeout = 500;
        const minTimeout = 10;
        const maxInvaders = 55; // 5 rows * 11 columns

        // Calculate the percentage of invaders remaining
        const percentageRemaining = invaders.length / maxInvaders;

        // Calculate the new timeout value based on the percentage of invaders remaining
        const newTimeout = baseTimeout * percentageRemaining;

        // Make sure the timeout value stays within the range [minTimeout, baseTimeout]
        return Math.max(minTimeout, Math.min(baseTimeout, newTimeout));
    }

    function calculateProjectileTimeout() {
        const baseTimeout = 1200; // Fire a projectile every 2 seconds initially
        const minTimeout = 300; // Minimum firing interval
        const maxInvaders = 55; // 5 rows * 11 columns

        // Calculate the percentage of invaders remaining
        const percentageRemaining = invaders.length / maxInvaders;

        // Calculate the new timeout value based on the percentage of invaders remaining
        const newTimeout = baseTimeout * (1 - (1 - percentageRemaining));

        // Add randomization between -250 and 250
        const randomizedTimeout = newTimeout + (Math.random() * 600) - 300;

        // Make sure the timeout value stays within the range [minTimeout, baseTimeout]
        return Math.max(minTimeout, Math.min(baseTimeout, randomizedTimeout));
    }

    function fireProjectileLoop() {
        const bottomInvaders = findBottomInvaders();
        fireFromRandomInvader(bottomInvaders, invaderProjectiles);

        const newTimeout = calculateProjectileTimeout();

        setTimeout(() => {
            requestAnimationFrame(fireProjectileLoop);
        }, newTimeout);
    }

    function moveInvadersLoop() {
        if (!pauseGame) {
            sounds.playInvadersMovingSound();
            moveInvaderDown = false;

            if (swapDirection) {
                if (moveDirection == 'right') {
                    moveDirection = 'left';
                } else {
                    moveDirection = 'right';
                }
                moveInvaderDown = true;
                swapDirection = false;
            }

            for (let i = 0; i < invaders.length; i++) {
                moveInvaders(i);

                if (invaders[i].x <= 10) {
                    swapDirection = true
                }

                if (invaders[i].x + invaders[i].width >= canvas.width - 10) {
                    swapDirection = true
                }
            }
        }

        const newTimeout = calculateTimeout(invaders);

        setTimeout(() => {
            requestAnimationFrame(moveInvadersLoop);
        }, newTimeout);
    }

    function delayAndThenGameOver() {
        setTimeout(() => {
            lives--;

            if (lives < 1) {
                requestAnimationFrame(() => {
                    showElement(gameLostContainer);
                });
                gameStarted = false
                pauseGame = true
                updateCursorStyle();
                return
            }

            pauseGame = false;
            playerVisible = true;
        }, 4000);
    }

    function moveUFO() {
        if (ufo) {
            if (!ufoSoundPlayed) {
                sounds.playUfoSound();
                ufoSoundPlayed = true;
            }

            ufo.move();

            if (ufo.x < -ufo.width || ufo.x > canvas.width) {
                clearInterval(ufoInterval);
                ufoOnScreen = false;
                ufoSoundPlayed = false;
                sounds.stopUfoSound();
                scheduleUFO();
            }
        }
    }

    function scheduleUFO() {
        if (!ufoOnScreen && !pauseGame) {
            const ufoImageSize = 1.5
            const randomInterval = 10000 + Math.random() * 30000;
            setTimeout(() => {
                let ufoDirection = Math.random() > 0.5 ? 1 : -1;
                let ufoX = ufoDirection === 1 ? -ufoImage.width / ufoImageSize : canvas.width;
                ufo = new UFO(ufoImage, ufoX, window.topMargin, 0.85 * speedMultiplier, ufoDirection, ctx);
                ufoInterval = setInterval(moveUFO, 1000 / 60); // Call moveUFO at 60 FPS
                ufoOnScreen = true;
            }, randomInterval);
        }
    }

    function shakeCanvas() {
        canvas.classList.add("shake");

        setTimeout(() => {
            canvas.classList.remove("shake");
        }, 1500);
    }

    function checkGameOver() {
        if (lowestInvaderYPos > player.y) {
            lives = 0;
            shakeCanvas();
            requestAnimationFrame(() => {
                showElement(gameLostContainer);
            });
            gameStarted = false
            pauseGame = true
            updateCursorStyle();
            return;
        }
    }

    function updateCursorStyle() {
        const canvas = document.getElementById("gameCanvas");
        if (gameStarted) {
            canvas.style.cursor = "none";
        } else {
            canvas.style.cursor = "default";
        }
    }

    function drawLivesDisplay() {
        const livesDisplayX = 10;
        const livesDisplayY = canvas.height - greenLineBottom + 20;
        const iconSpacing = 60;

        // Draw the number of lives
        ctx.font = '40px space-font';
        ctx.fillStyle = 'white';

        // Draw player icons for each life
        for (let i = 0; i < lives; i++) {
            const iconX = livesDisplayX + 10 + i * iconSpacing;
            ctx.drawImage(playerImage, iconX, 5 + livesDisplayY - playerImage.height / 2, playerImage.width * 2, playerImage.height);
        }
    }

    function drawScoreDisplay() {
        ctx.font = '40px space-font';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText("SCORE: " + player.score, 10, 40);
    }

    function update() {
        const moveSpeed = 0.5 * speedMultiplier;
        const explosionSpeed = 0.8 * speedMultiplier;
        const alphaSpeed = 0.01 * speedMultiplier;

        if (!pauseGame && keysPressed.ArrowLeft) {
            player.x = Math.max(0, player.x - moveSpeed);
        }

        if (!pauseGame && keysPressed.ArrowRight) {
            player.x = Math.min(canvas.width - player.width, player.x + moveSpeed);
        }

        // clean up explosions
        explosions.forEach((explosion, index) => {
            if (explosion.isDone()) {
                explosions.splice(index, 1);
            }
        });

        // Update explosions
        explosions.forEach(explosion => explosion.update());

        // Check invader for collisions
        invaderProjectiles.forEach((projectile, index) => {
            projectile.update();

            // Player hit test from invader projectiles
            if (playerVisible && isColliding(player, projectile)) {
                invaderProjectiles.splice(index, 1);
                const explosion = new ParticleExplosion(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    300,
                    3000,
                    explosionSpeed / 2.0,
                    alphaSpeed / 10.0
                );
                sounds.playPlayerExplodeSound();
                shakeCanvas();
                explosions.push(explosion);
                playerVisible = false;
                pauseGame = true;
                delayAndThenGameOver();
            }

            if (playerProjectile && isColliding(playerProjectile, projectile)) {
                invaderProjectiles.splice(index, 1);
                const explosion = new ParticleExplosion(projectile.x, projectile.y, 25, 250, explosionSpeed, alphaSpeed);
                explosions.push(explosion);
                playerProjectile = null
                return;
            }

            if (projectile.y + projectile.height > canvas.height - greenLineBottom) {
                console.log("bottom " + explosionSpeed)
                invaderProjectiles.splice(index, 1);
                const explosion = new ParticleExplosion(projectile.x, projectile.y, 25, 250, explosionSpeed, alphaSpeed);
                explosions.push(explosion);
                return;
            }

            barriers.forEach((barrier, bIndex) => {
                if (barrier.collisionDetection(projectile)) {
                    // Create an explosion on collision
                    const explosion = new ParticleExplosion(projectile.x + (projectile.width / 2.0),
                        projectile.y + projectile.height, 100, 50, explosionSpeed, alphaSpeed);
                    explosions.push(explosion);

                    // Remove the projectile on collision
                    invaderProjectiles.splice(index, 1);
                }
            });
        });

        if (playerProjectile) {
            playerProjectile.update();

            if (ufo && ufo.collision(playerProjectile)) {
                clearInterval(ufoInterval);
                // Create an explosion on collision
                const explosion = new ParticleExplosion(
                    ufo.x,
                    ufo.y + ufo.height / 2,
                    600,
                    300,
                    explosionSpeed,
                    alphaSpeed
                );
                explosions.push(explosion);

                const explosion2 = new ParticleExplosion(
                    ufo.x + ufo.width,
                    ufo.y + ufo.height / 2,
                    600,
                    300,
                    explosionSpeed,
                    alphaSpeed
                );
                explosions.push(explosion2);

                // Add 100 to the player's score
                const numbers = [200, 300, 400, 500];
                const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
                player.score += randomNumber;

                // Randomly add a new life, up to a maximum of 5 lives
                if (Math.random() > 0.5 && lives < 6) {
                    lives++;
                }
                // Remove the projectile & ufo
                playerProjectile = null;
                ufo = null;
                ufoSoundPlayed = false;
                ufoOnScreen = false;
                sounds.stopUfoSound();
                sounds.playUfoExplodeSound();
                scheduleUFO();
                return
            }

            if (playerProjectile.y < window.topMargin) {
                const explosion = new ParticleExplosion(playerProjectile.x + (playerProjectile.width / 2.0),
                    playerProjectile.y, 25, 25, explosionSpeed, alphaSpeed);
                explosions.push(explosion);
                playerProjectile = null;
                return
            } else {
                // Check for collisions between the projectile and each invader
                for (let i = 0; i < invaders.length; i++) {
                    if (isColliding(playerProjectile, invaders[i])) {
                        invaders[i].removeFromColumns();
                        sounds.playInvaderExplodeSound();
                        const explosion = new ParticleExplosion(invaders[i].x + (invaders[i].width / 2.0),
                            invaders[i].y + (invaders[i].height / 2.0), 150, 50, explosionSpeed, alphaSpeed);
                        explosions.push(explosion);
                        const invaderExplosion = new InvaderExplosion(invaders[i].x + (invaders[i].width / 2.0),
                            invaders[i].y + (invaders[i].height / 2.0), 10, 300, explosionSpeed/ 2.0, alphaSpeed / 5.0);
                        explosions.push(invaderExplosion);
                        player.score += invaders[i].scoreAmount
                        playerProjectile = null;
                        invaders.splice(i, 1);
                        break;
                    }
                }

                if (playerProjectile) {
                    barriers.forEach((barrier, bIndex) => {
                        if (barrier.collisionDetection(playerProjectile)) {
                            // Create an explosion on collision of lower barrier
                            const explosion = new ParticleExplosion(playerProjectile.x + (playerProjectile.width / 2.0), playerProjectile.y,
                                100, 100, explosionSpeed, alphaSpeed);
                            explosions.push(explosion);
                            playerProjectile = null;
                        }
                    });
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (playerVisible) {
            player.draw();
        }

        for (const invader of invaders) {
            invader.draw();
        }

        for (const projectile of invaderProjectiles) {
            projectile.draw();
        }

        if (playerProjectile) {
            playerProjectile.draw();
        }

        barriers.forEach(barrier => barrier.draw(ctx));

        explosions.forEach(explosion => explosion.draw(ctx));

        drawLivesDisplay();
        drawScoreDisplay();

        if (ufo && (ufo.x >= -ufo.width && ufo.x <= canvas.width)) {
            ufo.draw();
        }
    }

    let count = 0;
    const timeTest = Date.now();
    const timeOverDistanceBaseLineMillis = 150;
    let speedMultiplier = 0;
    function gameLoop() {
        if (calibrateSpeed) {
            count++;
            if (count > 60) {
                const result = Date.now() - timeTest;
                console.log("performance result millis: " + result);
                speedMultiplier = result / timeOverDistanceBaseLineMillis
                console.log("speedMultiplier:" + speedMultiplier);
                gameStarted = true;
                updateCursorStyle();
                scheduleUFO();
                moveInvadersLoop();
                fireProjectileLoop();
                console.log("startGame")
                calibrateSpeed = false;
            }
        }

        update();
        draw();

        requestAnimationFrame(gameLoop);
        drawGreenLine()

        checkGameOver()

        if (invaders.length === 0) {
            invaderProjectiles = []
            requestAnimationFrame(() => {
                showElement(gameWonContainer);
            });
            pauseGame = true
            gameStarted = false
            return;
        }
    }

    function showElement(element) {
        element.style.opacity = 1;
        element.style.zIndex = 1;
    }

    function startGame() {
        if (gameStarted) return;

        // Initialize the Sounds class
        sounds = new Sounds();

        // Start the game loop
        gameLoop();
    }

    document.addEventListener('keydown', (event) => {
        handleKeyDown(event);
    });

    document.addEventListener('keyup', handleKeyUp);

    startGame();
}

// **************************************************************************************
const instructionContainer = document.getElementById("instruction-container");
const gameLostContainer = document.getElementById("game-lost-container");
const gameWonContainer = document.getElementById("game-won-container");

function toggleGlow(elementId, add) {
    const element = document.getElementById(elementId);
    if (add) {
        element.classList.add("glow");
    } else {
        element.classList.remove("glow");
    }
}

["startGame", "retryGame", "playAgain"].forEach((elementId) => {
    document.getElementById(elementId).addEventListener("mouseover", () => toggleGlow(elementId, true));
    document.getElementById(elementId).addEventListener("mouseout", () => toggleGlow(elementId, false));
});

document.getElementById("startGame").addEventListener("click", () => {
    instructionContainer.classList.add("fade-out");
    invaders()
});

document.getElementById("retryGame").addEventListener("click", () => {
    gameLostContainer.classList.add("fade-out");
    location.reload()
});

document.getElementById("playAgain").addEventListener("click", () => {
    gameWonContainer.classList.add("fade-out");
    location.reload()
});

function hideElement(element) {
    element.classList.add("hidden");
}

instructionContainer.addEventListener("animationend", () => hideElement(instructionContainer));
gameLostContainer.addEventListener("animationend", () => hideElement(gameLostContainer));
gameWonContainer.addEventListener("animationend", () => hideElement(gameWonContainer));