// const EventEmitter = require('events').EventEmitter;

/*
Data sources take in text based data source
*/

var MAX_AGE = 111015;

class DataSource {

	constructor(args){
		// super();
		this.maxAge = MAX_AGE;
		if(args){
			if(args.sourceFile){
				this.sourceFile = args.sourceFile;
			}
		}
		this.name = 'DataSource';
		this._load();
	}

	_load(){

	}

	_parseData(){

	}

	_query(p){

	}

	emit(name, value){
		$(document).trigger(name, [value]);
	}

	set scale(scale){
		this.scale = scale;
	}

	get scale(){
		return this.scale;
	}

	scaleTime(time, minTime, maxTime){
		let range = maxTime - minTime;
		let timePct = time / range;
		return this.maxTime * timePct;
	}

	update(p){
		this._query(p);
	}

	_sendData(data){
		this.emit('data', {'name': this.name, 'data': data});
	}

}

// module.exports = DataSource;
