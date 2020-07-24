'use strict'

// const DataSource = require('./DataSource');
// const fs = require('fs');

class Temperature extends DataSource {

	constructor(args){
		super(args);
		this.name = 'temperature';
		this.dataPoints = [];
		this.minTemp = 1.6;
		this.maxTemp = 5.4;
		this.currentTemp = 4.0;
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
		//		this._parseData();
		// });
	}

	_parseData(){
		let lines = this.dataFile.split('\n');
		let re = /^[ \t]+[-+]?[0-9]*\.[0-9]+/;
		let capturingData = false;
		for(let i = 0; i < lines.length; i++){
			if(re.test(lines[i])){
				if(capturingData == false){
					capturingData = true;
				}
				let tokens = lines[i].split(/[ \t]+/);
				if(tokens.length == 3){
					this.dataPoints.push({'age': Math.round(1000 * Number(tokens[1])),
										  'temperature': Number(tokens[2])
					});
				}
			} else {
				if(capturingData){
					return;
				}
			}
		}
	}

	_query(p){

	}

}

// module.exports = Temperature;
