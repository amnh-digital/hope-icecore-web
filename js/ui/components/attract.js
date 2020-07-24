const NUM_CORES = 10;
const TRANSITION_TIME = 500;
const MAX_ROTATION = -90;

/*
The Pivot point.
*/

const CORE_X = 615;
const CORE_Y = 735;

/*
Scale factor for the resting state core.
*/

const CORE_SCALE_X = 0.605

/*
X, Y position of resting state core.
*/

const CORE_OFFSET_X = -537;
const CORE_OFFSET_Y = 0;

/*
Width and height of core. This will be scaled down for resting state
and back up during animation.
*/

const CORE_WIDTH = 1715;
const CORE_HEIGHT = 22;

/*
X, Y offset for end state of core.
*/

const CORE_END_OFFSET_X = 30;
const CORE_END_OFFSET_Y = 208;

/*
Core color. Primary blue.
*/

const CORE_COLOR = 'rgb(214, 220, 229)';

class AttractIceCore{

	constructor(pct, solid, timeout, callback){
		this.isAlive = true;
		this.pct = pct;
		this.solid = solid;
		this.rotationAmount = MAX_ROTATION * (1.0 - this.pct);
		this.fadingIn = false;
		window.setTimeout(() => callback(this), timeout);
	}

}

class Attract{

	constructor(){
		this.iceCores = [];
		this.timeline = null;
	}

	setTimeline(timeline){
		this.timeline = timeline;
	}

	start(){
		document.getElementById('attract-container').style.display = 'block';
		document.getElementById('attract-left').style.opacity = 1;
		document.getElementById('attract-right').style.opacity = 1;

		let canvas = document.getElementById('canvas-attract');
		let ctx = canvas.getContext('2d');
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.translate(CORE_X, CORE_Y);
		ctx.rotate(-90 * Math.PI / 180);
		ctx.scale(CORE_SCALE_X , 1.0);
		ctx.fillStyle = CORE_COLOR;
		ctx.strokeStyle = CORE_COLOR;
		ctx.fillRect(CORE_OFFSET_X, CORE_OFFSET_Y, CORE_WIDTH, CORE_HEIGHT);
		for(let i = 0; i < 10; i += 0.5){
			let f = Math.floor(i);
			ctx.beginPath();
			ctx.arc(CORE_OFFSET_X + CORE_WIDTH  - 10 + i, CORE_HEIGHT - 11, canvas.width * 0.005, 1.5 * Math.PI, 2.5 * Math.PI);
			ctx.arc(CORE_OFFSET_X + 10 - i, CORE_HEIGHT - 11, canvas.width * 0.005, 2.5 * Math.PI, 1.5 * Math.PI);
			ctx.stroke();
		}
	}

	stop(caller){
		document.getElementById('attract-left').style.opacity = 0;
		//document.getElementById('attract-right').style.display = 'none';
		//this.fadingIn = false;

		for(let i = 0; i < NUM_CORES; i++){
			let pct = i / NUM_CORES;
			window.setTimeout(() => this.addIceCore(pct, false, TRANSITION_TIME * 0.75, this.onComplete.bind(this)), TRANSITION_TIME * pct);
		}

		window.setTimeout(() => this.fadeIn(caller), TRANSITION_TIME);
		caller.turnOnBlur();
	}

	addIceCore(pct, solid, timeout, callback){
		this.iceCores.push(new AttractIceCore(pct, solid, timeout, callback));
		this.draw();
	}

	onComplete(iceCore){
		let index = this.iceCores.indexOf(iceCore);
		this.iceCores.splice(index, 1);
		this.draw();
	}

	draw(){
		let canvas = document.getElementById('canvas-attract');
		let canvasMask = document.getElementById('canvas-attract-mask');
		let ctx = canvas.getContext('2d');
		let ctxMask = canvasMask.getContext('2d');		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctxMask.setTransform(1, 0, 0, 1, 0, 0);
		ctxMask.clearRect(0, 0, canvas.width, canvas.height);
		for(let i = 0; i < this.iceCores.length; i++){
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctxMask.setTransform(1, 0, 0, 1, 0, 0);
			let pct = i / NUM_CORES;
			let iceCore = this.iceCores[i];
			ctx.translate(CORE_X, CORE_Y);
			ctx.rotate(iceCore.rotationAmount * Math.PI / 180);
			ctx.scale(CORE_SCALE_X + ((1.0 - CORE_SCALE_X) * iceCore.pct), 1.0);
			ctxMask.translate(CORE_X, CORE_Y);
			ctxMask.rotate(iceCore.rotationAmount * Math.PI / 180);
			//ctxMask.scale(0.5 + (0.5 * iceCore.pct), 0.5 + (0.3 * iceCore.pct));
			ctxMask.fillStyle = 'rgb(2, 51, 57)';
			ctxMask.fillRect(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct) + 700, CORE_OFFSET_Y, CORE_WIDTH, 200);
			ctx.strokeStyle = CORE_COLOR;
			ctx.beginPath();
			//ctx.rect(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct), CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct), CORE_WIDTH, CORE_HEIGHT);
			ctx.moveTo(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct), CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct));
			ctx.lineTo(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct) + CORE_WIDTH, CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct))
			ctx.stroke();
			ctx.beginPath();
			//ctx.rect(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct), CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct), CORE_WIDTH, CORE_HEIGHT);
			ctx.moveTo(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct), CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct) + CORE_HEIGHT);
			ctx.lineTo(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct) + CORE_WIDTH, CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct) + CORE_HEIGHT);
			ctx.stroke();
			//for(let i = 0; i < 10; i += 0.5){
				//let f = Math.floor(i);
			ctx.beginPath();
			ctx.arc(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct) + CORE_WIDTH, CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct) + CORE_HEIGHT / 2, canvas.width * 0.0055, 1.5 * Math.PI, 2.5 * Math.PI);
			//ctx.stroke();
			//ctx.beginPath();
			ctx.arc(CORE_OFFSET_X + (CORE_END_OFFSET_X * iceCore.pct), CORE_OFFSET_Y + (CORE_END_OFFSET_Y * iceCore.pct) + CORE_HEIGHT / 2, canvas.width * 0.0055, 2.5 * Math.PI, 1.5 * Math.PI);
			ctx.stroke();
			//}
		}
		if(this.fadingIn){
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(CORE_X, CORE_Y);
			ctx.fillStyle = CORE_COLOR;
			ctx.fillRect(CORE_OFFSET_X + CORE_END_OFFSET_X, CORE_OFFSET_Y + CORE_END_OFFSET_Y, CORE_WIDTH, CORE_HEIGHT);
			for(let i = 0; i < 10; i += 0.5){
				ctx.beginPath();
				ctx.arc(CORE_OFFSET_X + CORE_END_OFFSET_X + CORE_WIDTH - i, CORE_OFFSET_Y + CORE_END_OFFSET_Y + CORE_HEIGHT / 2, canvas.width * 0.0055, 1.5 * Math.PI, 2.5 * Math.PI);
				ctx.arc(CORE_OFFSET_X + CORE_END_OFFSET_X + i, CORE_OFFSET_Y + CORE_END_OFFSET_Y + CORE_HEIGHT / 2, canvas.width * 0.0055, 2.5 * Math.PI, 1.5 * Math.PI);
				ctx.stroke();
			}
		}
	}

	fadeIn(caller){
		this.fadingIn = true;
		window.setTimeout(() => this.hideIceCore(caller), TRANSITION_TIME);
	}

	hideIceCore(caller){
    document.getElementById('attract-right').style.opacity = 0;
		this.fadingIn = false;
		let canvas = document.getElementById('canvas-attract');
		let ctx = canvas.getContext('2d');
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		/*
		for(let i = 0; i < 2; i++){
			let pct = i / 2.0;
			window.setTimeout(caller.drawAttractTimeline(pct), 5 * i);
		}
		*/
		this.fadeColor(caller, 0.0);
		//window.setTimeout(caller.drawAttractTimeline(0.5),)
		//window.setTimeout(caller.drawAttractTimeline(0.5), 5);
		//window.setTimeout(() => this.allOff(caller), 1000);
	}

	fadeColor(caller, pct){
		if(pct > 1.0){
			this.revealBG(caller);
		} else {
			caller.drawAttractTimeline(pct);
			window.setTimeout(() => this.fadeColor(caller, pct + 0.1), 5);
		}
	}

	revealBG(caller){
		caller.turnOffBlur();
		document.getElementById('attract-container').style.backgroundColor = 'transparent';
		window.setTimeout(() => this.allOff(), 500);
	}

	allOff(caller){
		document.getElementById('attract-container').style.display = 'none';
		document.getElementById('attract-container').style.backgroundColor = 'rgb(0, 51, 57)';
	}
}

// module.exports = Attract;
