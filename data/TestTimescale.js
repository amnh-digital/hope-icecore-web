const Timescale = require('./Timescale');

var timescale = new Timescale({'sourceFile':'./gisp2age.txt'});

timescale.on('data', data => console.log(data));

var test = function(){
	for(let i = 0; i < 11; i++){
		let testNum = 1.0 - (i / 10.0);
		console.log(`Testing ${testNum}:`);
		timescale.update(testNum);
	}
	//timescale.update(0.5);
}

timescale.on('ready', () => {
	test();
});
