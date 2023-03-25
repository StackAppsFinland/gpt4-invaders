export class Sounds {
    constructor() {
        this.firingSound = new Audio("sounds/player-shooting.wav");
        this.invaderExplode = new Audio("sounds/invader-explode.wav");
        this.playerExplode = new Audio("sounds/player-explode.wav");
        this.ufoExplode = new Audio("sounds/ufo-explode.wav");
        this.ufoSound = null;
        this.ufoSoundLow = null;
        this.invaderSounds = [];
        this.invaderSounds.push(new Audio("sounds/fastinvader1.wav"));
        this.invaderSounds.push(new Audio("sounds/fastinvader2.wav"));
        this.invaderSounds.push(new Audio("sounds/fastinvader3.wav"));
        this.invaderSounds.push(new Audio("sounds/fastinvader4.wav"));
        this.index = 0;
        this.soundEnabled = true
    }

    playFiringSound() {
        this.firingSound.currentTime = 0;
        this.playSound(this.firingSound)
    }

    playInvaderExplodeSound() {
        this.invaderExplode.currentTime = 0;
        this.playSound(this.invaderExplode);
    }

    playPlayerExplodeSound() {
        this.playerExplode.currentTime = 0;
        this.playSound(this.playerExplode);
    }
    
    playUfoExplodeSound() {
        this.ufoExplode.currentTime = 0;
        this.playSound(this.ufoExplode);
    }

    playUfoSound() {
        if (!this.ufoSound) {
            this.ufoSound = new Audio('sounds/ufo-highpitch.wav');
            this.ufoSoundLow = new Audio('sounds/ufo-lowpitch.wav');
            this.ufoSound.volume = 0.3
            this.ufoSoundLow.volume = 0.3
            this.ufoSound.loop = true; // Set the loop property to true
            this.ufoSoundLow.loop = true; // Set the loop property to true
        }
        this.ufoSound.play();
        this.ufoSoundLow.play();
    }

    stopUfoSound() {
        if (this.ufoSound) {
            this.ufoSound.pause();
            this.ufoSound.currentTime = 0;
            this.ufoSound = null

            this.ufoSoundLow.pause();
            this.ufoSoundLow.currentTime = 0;
            this.ufoSoundLow = null
        }
    }

    playInvadersMovingSound() {
        this.playSound(this.invaderSounds[this.index]);
        this.index++;
        if (this.index > 3) this.index = 0;
    }

    playSound(sound) {
        if (this.soundEnabled) {
            sound.play();
        }
    }
}