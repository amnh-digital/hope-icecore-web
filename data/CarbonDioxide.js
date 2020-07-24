'use strict'

// const DataSource = require('./DataSource');
// const fs = require('fs');

class CarbonDioxide extends DataSource {

	constructor(args){
		super(args);
		this.name = 'co2';
		this._load();
		this.minAmt = 148;
		this.maxAmt = 216;
		this.currentAmt = 200;
	}

	_load(){

	}

	_query(p){
		var selectedAmt = this.minAmt + ((this.maxAmt - this.minAmt) * p);
		var greater = false;
		if(selectedAmt > this.currentAmt){
			greater = true;
		}
		var result = {'val': Math.floor(selectedAmt), 'greater': greater};
		this._sendData(result);
	}

}

// module.exports = CarbonDioxide;
