


let env = {};
env.getNumStates = function() { return COLLUMNS * ROWS; }
env.getMaxNumActions = function() { return COLLUMNS; }



const CANVASWIDTH = 1500;
const CANVASHEIGHT = 1000;
const BIRDPOSX = 30;
const BIRDINITPOSY = CANVASHEIGHT / 2;
const TIMEBETWEENPILLARS = 2500;
const SIZEPASSAGE = 200;
const MINMAXSIZEPILLAR = -1000;
const BIRDJUMPHEIGHT = 100;
const BIRDDROPRATE = 2.5;
const BIRDDROPTIMEOUT = 10;
const BIRDROTATEVALUE = 30;
const BIRDROTATEENDTIME = 150;
const BIRDSCALE = 0.15;
const PILLARSCALE = 1;
const PILLARHEIGHT = 410;
const PILLARWIDTH = 150;


let pillarsSpeed = 3.5;
let x = CANVASWIDTH;

class EventHandler {
    constructor(bird) {
        document.addEventListener('keydown', (key) => {
            if (key.code == "Space") { // if space key is pressed
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
        this.width = img.width * BIRDSCALE - 5;
        this.height = img.height * BIRDSCALE;
        this.velocity = 0;
        this.rotation = 0;
        this.rotateEndTimeout;
        this.birdImage = img;
        this.konvaBird;
        this.sizeWhenRotate = 30;

        this.generateKonva();
        this.drop();
    }
    jump() {
        clearTimeout(this.rotateEndTimeout);
        this.setRotation(-BIRDROTATEVALUE);
        this.velocity = 5;
        let jumpHeight = 0;
        let birdJumpInterval = setInterval(() => {
            if (jumpHeight >= BIRDJUMPHEIGHT) {
                this.rotateEndTimeout = setTimeout(() => {
                    this.setRotation(0);
                    this.rotateEndTimeout = setTimeout(() => {
                        this.setRotation(BIRDROTATEVALUE);
                    }, BIRDROTATEENDTIME);
                }, BIRDROTATEENDTIME);
                clearInterval(birdJumpInterval);
            }
            let frameJumpSize = this.velocity + BIRDDROPRATE;
            if (this.y > this.sizeWhenRotate) {
                this.y -= frameJumpSize;
            }
            jumpHeight += frameJumpSize;
        }, 5);
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
        this.pillarTopHeight = imgTop.height;
        
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
        this.eventHandler = new EventHandler(this.bird);

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
		this.bird = new Bird(this.imgBird, this);
		for (let index = 0; index < this.pillars.length(); index++) {
			this.konvaHandler.removePillars(this.pillars.getFirst());
		}
		//this.konvaHandler.clearPillars();
		this.pillars.reset();
        this.pillars.createNewPillars();
        this.konvaHandler.drawNewPillars(this.pillars.getLast());
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
                    alert("Percuté un mur");
					this.reset();
                } else if (this.bird.y <= firstPillar.yTop || this.bird.y + this.bird.height >= firstPillar.yTop + SIZEPASSAGE) {
                    alert("Vous vous êtes posé");
					this.reset();
                }
            }
        }, 50);
    }
    handleRemovePillars() {
        setInterval(() => {
            if (this.pillars.getFirst().x <= -PILLARWIDTH) {
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