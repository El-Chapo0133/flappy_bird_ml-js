


let env = {};
env.getNumStates = function() { return COLLUMNS * ROWS; }
env.getMaxNumActions = function() { return COLLUMNS; }



const CANVASWIDTH = 1500;
const CANVASHEIGHT = 500;
const BIRDPOSX = 30;
const BIRDINITPOSY = CANVASHEIGHT / 2;
const TIMEBETWEENPILLARS = 3500;
const SIZEPASSAGE = 200;
const MINMAXSIZEPILLAR = 100;
const BIRDJUMPHEIGHT = 100;
const BIRDDROPRATE = 3.5;
const BIRDDROPTIMEOUT = 10;
const BIRDROTATEVALUE = 30;
const BIRDROTATEENDTIME = 150;
const BIRDSCALE = 0.15;
const BIRDROTATEVELOCITYBASE = 2;
const BIRDJUMPVELOCITYBASE = 5;
const PILLARSCALE = 1.5;
const PILLARHEIGHT = 410;
const PILLARWIDTH = 89 * PILLARSCALE;

// Display options
const DISPLAYLOSTANIMATION = true;


let pillarsSpeed = 5.5;
let x = CANVASWIDTH;

class EventHandler {
    constructor(game, bird) {
        document.addEventListener('keydown', (key) => {
            if (key.code == "Space" && !game.lost) { // if space key is pressed and game isn't lost
                bird.jump();
            }
        });
    }
}
class Bird {
    constructor(img, game) {
        this.game = game;
        this.x = BIRDPOSX;
        this.y = BIRDINITPOSY;
        this.baseWidth = img.width * BIRDSCALE;
        this.width = img.width * BIRDSCALE - 10;
        this.heightDown = img.height * BIRDSCALE;
        this.heightUp = 0;
        this.jumpVelocity = BIRDJUMPVELOCITYBASE;
        this.rotateVelocity = BIRDROTATEVELOCITYBASE;
        this.rotation = 0;
        this.rotateInterval;
        this.birdJumpInterval;
        this.birdImage = img;
        this.konvaBird;
        this.sizeWhenRotate = 30;

        this.generateKonva();
        this.drop();
    }
    jump() {
        clearInterval(this.rotateInterval);
        clearInterval(this.birdJumpInterval);
        this.setRotation(-BIRDROTATEVALUE);
        this.jumpVelocity = BIRDJUMPVELOCITYBASE;
        this.heightUp = 30;
        this.heightDown = 20;
        let jumpHeight = 0;
        this.birdJumpInterval = setInterval(() => {
            if (jumpHeight >= BIRDJUMPHEIGHT) {
                this.startRotationDown();
                clearInterval(this.birdJumpInterval);
            }
            let frameJumpSize = this.jumpVelocity + BIRDDROPRATE;
            this.jumpVelocity -= 0.2;
            if (this.y > this.sizeWhenRotate) {
                this.y -= frameJumpSize;
            }
            jumpHeight += frameJumpSize;
        }, 5);
    }
    startRotationDown() {
        this.rotateVelocity = BIRDROTATEVELOCITYBASE;
        let refThis = this;
        this.rotateInterval = setInterval(() => {
            if (refThis.rotation >= BIRDROTATEVALUE) {
                clearInterval(refThis.rotateInterval);
            }
            refThis.rotation += refThis.rotateVelocity;
            refThis.rotateVelocity += 0.1;
            refThis.heightUp -= refThis.rotateVelocity / 2;
            refThis.heightDown += refThis.rotateVelocity / 2;
        }, 0);
    }
    setRotation(rotation) {
        this.rotation = rotation;
        if (rotation == BIRDROTATEVALUE) {
            this.width = this.baseWidth - 30;
        } else if (rotation == 0) {
            this.width = this.baseWidth - 5;
        } else if (rotation == -BIRDROTATEVALUE) {
            this.width = this.baseWidth + 15;
        }
    }
    drop() {
        setInterval(() => {
            this.y += BIRDDROPRATE;
            if (this.y + this.height >= CANVASHEIGHT - this.sizeWhenRotate) {
                alert("You lost");
				this.game.reset();
            }
        }, BIRDDROPTIMEOUT);
    }
    generateKonva() {
        this.konvaBird = new Konva.Image({
            x: BIRDPOSX,
            y: BIRDINITPOSY,
            image: this.birdImage,
            scaleX: BIRDSCALE,
            scaleY: BIRDSCALE,
        });
    }
}
class KonvaHandler {
    constructor() {
        this.stage;
        this.layerBird;
        this.layerPillars;

        this.initScreen();
    }
    initScreen() {
        this.stage = new Konva.Stage({
            container: "main",
            width: CANVASWIDTH,
            height: CANVASHEIGHT,
        });
        
        this.layerBird = new Konva.Layer();
        this.layerPillars = new Konva.Layer();
        this.stage.add(this.layerPillars);
        this.stage.add(this.layerBird);
    }
    drawBird(bird) {
        this.layerBird.add(bird.konvaBird);
        this.layerBird.batchDraw();
    }
    animateBird(bird) {
        this.animateBird = new Konva.Animation(frame => {
            bird.konvaBird.y(bird.y);
            bird.konvaBird.rotation(bird.rotation);
        }, this.layerBird);
    }
    drawNewPillars(pillarsInput) {
        pillarsInput.konvas.forEach(pillar => {
            this.layerPillars.add(pillar);
        });
        this.layerPillars.batchDraw();
    }
    animatePillars(pillars) {
        this.pillarsAnimation = new Konva.Animation(frame => {
            for (let index = 0; index < pillars.length(); index++) {
                pillars.get(index).konvas[0].x(pillars.get(index).x);
                pillars.get(index).konvas[1].x(pillars.get(index).x);
                pillars.get(index).x -= pillarsSpeed;
            }
        }, this.layerPillars);
    }
    startAnimate() {
        this.pillarsAnimation.start();
        this.animateBird.start();
    }
    stopAnimatePillars() {
        this.pillarsAnimation.stop();
    }
    restartAnimatePillars() {
        this.pillarsAnimation.start();
    }
    removePillars(pillars) {
        pillars.konvas.forEach(cell => {
            this.layerPillars.remove(cell);
        });
    }
	clearPillars() {
		this.layerPillars.clear();
	}
}
class Pillar {
    constructor(imgTop, imgBottom) {
        this.x = CANVASWIDTH;
        this.yTop;
        this.width = PILLARWIDTH;
        this.pillarTopHeight = imgTop.height * PILLARSCALE;
        
        this.generateYTop();
        this.konvas = this.generateKonva(imgTop, imgBottom);
    }
    generateYTop() {
        this.yTop = Math.floor(Math.random() * (CANVASHEIGHT - SIZEPASSAGE - MINMAXSIZEPILLAR)) + MINMAXSIZEPILLAR;
    }
    generateKonva(imgTop, imgBottom) {
        return [
            new Konva.Image({
                x: this.x,
                y: -this.pillarTopHeight + this.yTop,
                image: imgTop,
                // width: this.width,
                // height: this.yTop,
                scaleX: PILLARSCALE,
                scaleY: PILLARSCALE,
            }),
            new Konva.Image({
                x: this.x,
                y: this.yTop + SIZEPASSAGE,
                image: imgBottom,
                // width: this.width,
                // height: CANVASHEIGHT - this.yTop - SIZEPASSAGE,
                scaleX: PILLARSCALE,
                scaleY: PILLARSCALE,
            }),
        ];
    }
}
class Pillars {
    constructor(imgTop, imgBottom) {
        this.imgTop = imgTop;
        this.imgBottom = imgBottom;
        this.pillars = [];
    }
    createNewPillars() {
        this.pillars.push(new Pillar(this.imgTop, this.imgBottom));
    }
    addPillar(pillar) {
        this.pillars.push(pillar);
    }
    removeFirst() {
        this.pillars.shift();
    }
    get(index) {
        return this.pillars[index];
    }
    getLast() {
        return this.pillars[this.pillars.length - 1];
    }
    getFirst() {
        return this.pillars[0];
    }
    length() {
        return this.pillars.length;
    }
	reset() {
		this.pillars = [];
	}
}
class ImageLoader {
    constructor() {
        this.imagesToLoad = 3;
        this.imageLoaded = 0;
        this.bird = new Image();
        this.pillarTop = new Image();
        this.pillarBottom = new Image();
    }
    load() {
        let refThis = this;
        return new Promise((resolve, reject) => {
            let imageLoaded = 0;
            refThis.bird.onload = () => { imageLoaded++; };
            refThis.pillarTop.onload = () => { imageLoaded++; };
            refThis.pillarBottom.onload = () => { imageLoaded++; };
    
            refThis.bird.src = "images/bird.png";
            refThis.pillarTop.src = "images/pillarTop.png";
            refThis.pillarBottom.src = "images/pillarBottom.png";
            setInterval(() => {
                if (imageLoaded == refThis.imagesToLoad) {
                    resolve([refThis.bird, refThis.pillarTop, refThis.pillarBottom]);
                }
            });
        });
    }
}
class Game {
    constructor() {
		this.score = 0;
        this.lost = false;
        this.resetted = false;
		this.scoreUpdated = false;
        this.eventHandler;
        this.konvaHandler = new KonvaHandler();
		this.imgBird;
		this.imgPillarTop;
		this.imgPillarBottom;

        this.loader = new ImageLoader();

        this.loadImages();
    }
    loadImages() {
        let refThis = this;
        this.loader.load().then(images => {
            refThis.initGame(images);
        });
    }
    initGame(images) {
        this.imgBird = images[0];
        this.pillarTop = images[1];
        this.pillarBottom = images[2];
        this.pillars = new Pillars(this.pillarTop, this.pillarBottom);
        this.bird = new Bird(this.imgBird, this);
        this.eventHandler = new EventHandler(this, this.bird);

        this.pillars.createNewPillars(); // create the two first pillars
        this.konvaHandler.drawNewPillars(this.pillars.getLast());
        this.konvaHandler.animatePillars(this.pillars);
        this.konvaHandler.drawBird(this.bird);
        this.konvaHandler.animateBird(this.bird);
        this.konvaHandler.startAnimate();

        this.startGame();
        this.handleBirdTouchPillars();
        this.handleRemovePillars();
    }
    startGame() {
        setInterval(() => {
            this.pillars.createNewPillars();
            this.konvaHandler.drawNewPillars(this.pillars.getLast());
        }, TIMEBETWEENPILLARS);
    }
    reset() {
        this.resetted = true;
        this.lost = false;
        this.score = 0;
        this.updateTextScore();

        console.log("hey");

        this.bird = new Bird(this.imgBird, this);
        // for (let index = 0; index < this.pillars.length(); index++) {
        //     this.konvaHandler.removePillars(this.pillars.getFirst());
        // }
        this.konvaHandler.clearPillars();
        this.konvaHandler.restartAnimatePillars();
        this.pillars.reset();
        this.pillars.createNewPillars();
        this.konvaHandler.drawNewPillars(this.pillars.getLast());
    }
    handleLost() {
        let refThis = this;
        this.lost = true;
        this.konvaHandler.stopAnimatePillars();

        if (DISPLAYLOSTANIMATION) {
            let intervalLost = setInterval(() => {
                if (refThis.bird.y > CANVASHEIGHT) {
                    clearInterval(intervalLost);
                    if (!refThis.resetted) {
                        refThis.reset();
                    }
                }
                this.bird.y += 1;
            }, 10);
        } else {
            this.reset();
        }
    }
    handleBirdTouchPillars() {
        setInterval(() => {
            let firstPillar = this.pillars.getFirst();
            if (this.bird.x + this.bird.width >= firstPillar.x && this.bird.x + this.bird.width <= firstPillar.x + PILLARWIDTH) {
                if (!this.scoreUpdated) {
					this.score += 1;
					this.scoreUpdated = true;
				}
				this.updateTextScore();
				if (this.bird.y + this.bird.width <= firstPillar.yTop || this.bird.y + this.bird.width >= firstPillar.yTop + SIZEPASSAGE) {
                    // alert("Percuté un mur");
					this.handleLost();
                } else if (this.bird.y - this.bird.heightUp <= firstPillar.yTop) {
                    // alert("Touché le top d'un poto");
					this.handleLost();
                } else if (this.bird.y + this.bird.heightDown >= firstPillar.yTop + SIZEPASSAGE) {
                    // alert("Touché le bottom d'un poto");
					this.handleLost();
                }
            }
        }, 50);
    }
    handleRemovePillars() {
        setInterval(() => {
            if (this.pillars.getFirst().x <= -PILLARWIDTH * PILLARSCALE) {
                // this.konvaHandler.removePillars(this.pillars.getfirst());
                this.pillars.removeFirst();
				this.scoreUpdated = false;
            }
        }, 50);
    }
    updateTextScore() {
		document.getElementById("score").innerHTML = this.score;
    }
}


let game = new Game();



console.log("Code me daddy!");