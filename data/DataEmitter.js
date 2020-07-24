// const EventEmitter = require('events').EventEmitter;
// const path = require('path');
//
// const positionTracker = require('../PositionTracker')

// const Timescale = require(path.resolve('electron/data/Timescale'));
// const Temperature = require(path.resolve('electron/data/Temperature'));
// const CarbonDioxide = require(path.resolve('electron/data/CarbonDioxide'));
// const SeaLevel = require(path.resolve('electron/data/SeaLevel'));
// const Population = require(path.resolve('electron/data/Population'))

let TIMESCALE_FILE = 'data/gisp2age.txt';
let TEMPERATURE_FILE = 'data/gisp2_temp_accum_alley2000.txt';

class DataEmitter {

	constructor(){
		// super();
		//this.name = 'timescale';
		this.sources = []
		this.sources.push(new Timescale({'sourceFile': TIMESCALE_FILE}));
		this.sources.push(new Temperature({'sourceFile': TEMPERATURE_FILE}));
		this.sources.push(new CarbonDioxide());
		this.sources.push(new SeaLevel());
		this.sources.push(new Population());
		// this.sources.forEach((source) => source.on('data', data => this._sendData(data)));
		// positionTracker.on('change', p => this.update(p.position));
		var _this = this;
		$(document).on('position-change', function(e, p) {
      _this.update(p.position);
    });
	}

	_sendData(data){
		this.emit('data', data);
	}

	emit(name, value){
		$(document).trigger(name, [value]);
	}

	update(p){
		this.sources.forEach((source) => source.update(p + -.01));
	}

}

var dataEmitter = new DataEmitter();
// module.exports = new DataEmitter();
