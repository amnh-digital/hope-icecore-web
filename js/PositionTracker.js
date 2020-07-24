// const readline = require('readline');
// const dgram = require('dgram');
// const EventEmitter = require('events').EventEmitter;

const KEYBOARD_RESOLUTION = 0.005;
const POSITION_RING_LENGTH = 1;

/*
Input throttle in MS.
*/

const INPUT_THROTTLE = 100;

/*
Input min/max for scaling.
*/

const INPUT_MIN = 0.02;
const INPUT_MAX = 0.98;

// readline.emitKeypressEvents(process.stdin);
// if(process.stdin.isTTY === false) process.stdin.setRawMode(true);

class PositionTracker{

	constructor(){
 		// super();
 		this.name = 'PositionTracker';
 		this.position = 0.0;
 		// this.socket = dgram.createSocket('udp4');
 		// this.initSocket();
 		//this.initKeyboard();
 		this.timeOfLastInput = null;
 		this.lastPosition = 0.0;
 		this.positionRing = [];
 		this.positionRing.length = POSITION_RING_LENGTH;
 		this.velocityRing = [];
 		this.velocityRing.length = POSITION_RING_LENGTH;
 		for(let i =0; i < this.positionRing.length; i++){this.positionRing[i] = 0;}
 		this.currentRingPosition = 0;
 		this.currentVelocity = 0;
 		this.velocityTimeout = null;
 		this.receiveInput = true;
 	}

 	set currentPosition(val) {
 		if(this.timeOfLastInput === null){
 			this.timeOfLastInput = Date.now();
 			this.lastPosition = val;
 		}
 		//if(val === this.position){
 		//	return;
 		//}
 		if(val < 0.0){
 			val = 0.0;
 		}
 		if(val > 1.0){
 			val = 1.0;
 		}

 		/*
 		Add new position to position ring and get average.
 		*/

 		this.positionRing[this.currentRingPosition] = val;
 		this.currentRingPosition = (this.currentRingPosition + 1) % this.positionRing.length;
 		let sum = 0;
 		let vSum = 0;
 		for(let i = 0; i < this.positionRing.length; i++){
 			sum += this.positionRing[i];
 		}
 		let averagedPosition = sum / this.positionRing.length;
 		let now = Date.now();
 		let deltaTime = now - this.timeOfLastInput;
 		let movement = this.lastPosition - averagedPosition;
 		this.currentVelocity = Math.abs(movement / deltaTime * 1000);
 		this.position = averagedPosition;

 		/*
 		Scale position between min and max.
 		*/

 		//let scaledPosition = this.position * (INPUT_MAX - INPUT_MIN) + INPUT_MIN;
 		let scaledPosition = (this.position - INPUT_MIN) / (INPUT_MAX - INPUT_MIN);
 		if(scaledPosition < 0.0){
 			scaledPosition = 0.0;
 		}
 		if(scaledPosition > 1.0){
 			scaledPosition = 1.0;
 		}
 		// console.log(`Emitting ${scaledPosition} from ${this.position}`);

 		/*
 		Emit the new averaged and scaled position.
 		*/

 		this.emit('position-change', {'position': scaledPosition, 'velocity': this.currentVelocity});
 		this.lastPosition = this.position;
 		this.timeOfLastInput = now;

 		/*
		Set timeout to reduce velocity over time.
 		*/

 		if(this.velocityTimeout){
 			clearTimeout(this.velocityTimeout);
 		}
 		if(this.currentVelocity > 0.0001){
	 		this.velocityTimeout = setTimeout(() => this.reduceVelocity(), 100);
	 	}

	 	/*
	 	Set receiveInput to false and use timeout to reset it.
	 	*/

	 	this.receiveInput = false;
	 	setTimeout(() => this.receiveInput = true, INPUT_THROTTLE);
 	}

 	reduceVelocity(){
 		this.currentPosition = this.position;
 	}

 	get currentPosition() {
 		return this.position;
 	}

 	increment(){
 		this.currentPosition += KEYBOARD_RESOLUTION;
 		if(this.currentPosition > 1.0){
 			this.currentPosition = 1.0;
 		}
 	}

 	decrement(){
 		this.currentPosition -= KEYBOARD_RESOLUTION;
 		if(this.currentPosition < 0.0){
 			this.currentPosition = 0.0;
 		}
 	}

	emit(name, value){
		$(document).trigger(name, [value]);
	}

 	initSocket() {

 		this.socket.on('error', (err) => {
	  		console.error(`socket error:\n${err.stack}`);
	  		this.socket.close();
		});

		this.socket.on('message', (msg, rinfo) => {
			let position = parseFloat( msg.toString('utf8').replace(/^p/,'') );

			/*
			if(this.receiveInput){
			*/
			this.currentPosition = position;
			/*
			}
			*/

		});

		this.socket.on('listening', () => {
	  		const address = this.socket.address();
	  		console.log(`socket listening ${address.address}:${address.port}`);
		});

		console.log('Binding socket 8000.');
		this.socket.bind(8000);
 	}

 	initKeyboard() {
 		process.stdin.on('keypress', (str, key) => {
 			if (key.name === 'left'){
 				this.currentPosition = this.currentPosition - KEYBOARD_RESOLUTION
 			}
 			if (key.name === 'right'){
 				this.currentPosition = this.currentPosition + KEYBOARD_RESOLUTION
 			}
 		});
 	}

}

var positionTracker = new PositionTracker();
