'use strict'

// const DataSource = require('./DataSource');
// const fs = require('fs');

class SeaLevel extends DataSource {

	constructor(args){
		super(args);
		this.name = 'seaLevel';
		this._load();
		this.minSeaLevel = 60.2;
		this.maxSeaLevel = 120.2;
		this.currentSeaLevel = 100.0;
	}

	_load(){

	}

	_query(p){
		var selectedSeaLevel = this.minSeaLevel + ((this.maxSeaLevel - this.minSeaLevel) * p);
		var greater = false;
		if(selectedSeaLevel > this.currentSeaLevel){
			greater = true;
		}
		var result = {'val': selectedSeaLevel.toFixed(1), 'greater': greater};
		this._sendData(result);
	}

}

// module.exports = SeaLevel;
