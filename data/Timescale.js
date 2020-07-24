'use strict'

// const DataSource = require('./DataSource');
// const fs = require('fs');

const MAX_DEPTH = 3060.0;

class Timescale extends DataSource{

	constructor(args){
		super(args);
		this.name = 'timescale';
		this.dataPoints = []
		this.minYear = 0;
		this.maxYear = 0;
		this.previousResult = null;
	}

	_load(){
		var _this = this;
		$.ajax({
		    url : _this.sourceFile,
		    success : function(result){
					_this.dataFile = result;
		    	_this._parseData();
		    }
		});
		// var readStream = fs.createReadStream(this.sourceFile, 'utf8');
		// readStream.on('data', chunk => {
		// 	this.dataFile += chunk;
		// }).on('end', () => {
		// 	this._parseData();
		// });
	}


	_getMinMax(){
		this.dataPoints.forEach(dataPoint => {
			if(dataPoint['iceAge'] < this.minYear){
				this.minYear = dataPoint['iceAge'];
			}
			if(dataPoint['iceAge'] > this.maxYear){
				this.maxYear = dataPoint['iceAge'];
			}
		});
		console.log(`min/max = ${this.minYear}/${this.maxYear}`)
		this.emit('ready');
	}

	/*
	Read the data and parse the lines that begin with a number and are
	tab delineated.
	*/

	_parseData(){
		var lines = this.dataFile.split('\n');
		var re = /^[-+]?[0-09]*\.?[0-9]+/;
		for(let i = 0; i < lines.length; i++){
			if(re.test(lines[i])){
				let tokens = lines[i].split('\t');
				if(tokens.length == 3){
					this.dataPoints.push({'depth': Number(tokens[0]),
										  'iceAge': Number(tokens[1]) + 38,
										  'gasAge': Number(tokens[2])
					});
				}
			}
		}
		this._getMinMax();
	}

	_query(p){
		let position = 0.99 - p;
		let depth = MAX_DEPTH * position;
		if(depth > MAX_DEPTH){
			depth = MAX_DEPTH;
		}
		if(depth < 0.0){
			depth = 0.0;
		}
		let dp = this.dataPoints[0]
		for(let i = 0; i < this.dataPoints.length; i++){
			if(this.dataPoints[i].depth < depth){
				dp = this.dataPoints[i];
			}
		}
		this._sendData(dp);
	}

	/*
	_query(p){
		console.log(this.name + ' querying.');
		var range = this.maxYear - this.minYear;
		var queryVal = this.minYear + (range * (1.0 - p)) ;
		console.log(`Querying a range of ${range} years|val = ${queryVal}`);
		var result = this.dataPoints[0];
		var index = 0;
		for(var i = 0; i < this.dataPoints.length; i++){
			if(this.dataPoints[i]['iceAge'] < queryVal){
				result = this.dataPoints[i];
				index = i;
			}
		}
		if((index + 1) < this.dataPoints.length){
			var iceAgeDiff = this.dataPoints[index + 1].iceAge - this.dataPoints[index].iceAge;
			var depthDiff = this.dataPoints[index + 1].depth - this.dataPoints[index].depth;
			var gasAgeDiff = this.dataPoints[index + 1].gasAge - this.dataPoints[index].gasAge
			var queryDiff = queryVal - this.dataPoints[index].iceAge;
			var queryDiffPct = queryDiff / iceAgeDiff;
			var output = {}
			output.iceAge = Math.round(result.iceAge + (iceAgeDiff * queryDiffPct));
			output.depth  = Math.round(result.depth + (depthDiff * queryDiffPct));
			output.gasAge = Math.round(result.gasAge + (gasAgeDiff * queryDiffPct));
			if(output !== this.previousResult){
				this._sendData(output);
				this.previousResult = output;
			}
		} else {
			if(result !== this.previousResult){
				this._sendData(result);
				this.previousResult = result;
			}
		}
	}
	*/
}

// module.exports = Timescale;
