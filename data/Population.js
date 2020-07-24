'use strict'

// const DataSource = require('./DataSource');
// const fs = require('fs');

class Population extends DataSource {

	constructor(args){
		super(args);
		this.name = 'population';
		this._load();
		this.minPop = 1;
		this.maxPop = 100;
		this.currentPop = 7000;
	}

	_load(){

	}

	_query(p){
		//console.log('Querying population.');
		var selectedPop = this.minPop + ((this.maxPop - this.minPop) * p);
		var greater = false;
		if(selectedPop > this.currentPop){
			greater = true;
		}
		var result = {'val': selectedPop.toFixed(1), 'greater': greater};
		this._sendData(result);
	}

}

// module.exports = Population;
