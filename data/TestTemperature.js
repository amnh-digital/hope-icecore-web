const Temperature = require('./Temperature');

var temperature = new Temperature({'sourceFile':'./gisp2_temp_accum_alley2000.txt'});

temperature.on('data', data => console.log(data));

var test = function(){
	temperature.update(0.5);
}

temperature.on('ready', () => {
	test();
});
