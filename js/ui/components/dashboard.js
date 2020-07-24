// const path = require('path');

let truncate = function(num, numDigits){
	let truncated = num.toFixed(numDigits);
	let tokens = truncated.split()
}

class DashboardItem {

	constructor(sourceFile, tag, currentValue, round=true, scale=false){
		console.log('loading ' + tag);
		this.sourceFile = requireJSON(sourceFile);
		this.tag = tag
		this.currentValue = this.sourceFile[this.tag].presentValue;
		this.round = round;
		this.scale = scale;
		this.data = this.sourceFile[this.tag].data;
	}

	query(t){
		let dp = this.data[0].slice();
		for(let i = 0; i < this.data.length; i++){
			if(t < this.data[i][0]){
				dp = this.data[i];
			}
		}
		dp['diff'] = dp[1] - this.currentValue;
		if(this.round){
			if((t - dp[0]) > 1000.0){
				dp[1] = 'No data';
				dp['diff'] = 'No data'
			}
		}
		//console.log(t);
		if(t > 110000){
			dp[1] = 'No data';
			dp['diff'] = 'No data';
		}
		if(this.scale){
			let output = {};
			output[0] = dp[0];
			output[1] = dp[1] / 1000000.0;
			this.setDisplay(output);
		} else {
			this.setDisplay(dp);
		}
	}

	setDisplay(dp){
		let el = document.getElementById('dyn-' + this.tag);
		if(this.tag == 'temperature'){
			let val = dp['diff'];
			if(val == 'No data' || isNaN(val)){
				document.getElementById('temp-f').innerHTML = '';
				document.getElementById('temp-sym').innerHTML = '';
				document.getElementById('temp-label').innerHTML = 'than';
				document.getElementById('temp-sub-label').innerHTML = '&nbsp;today';
				el.innerHTML = 'cooler';
				return;
			} else {
				let degreesF = val * 1.8;
				document.getElementById('temp-f').innerHTML = degreesF.toFixed(1);
				document.getElementById('temp-sym').innerHTML = '&#176;F';
				document.getElementById('temp-label').innerHTML = '&#176;C relative';
				document.getElementById('temp-sub-label').innerHTML = '&nbsp to today';
			}
			el.innerHTML = val.toFixed(1);
		}
		if(this.tag == 'co2'){
			let val = dp[1];
			if(val == 'No data' || isNaN(val)){
				el.innerHTML = 'lower';
				document.getElementById('co2-label').innerHTML = 'than';
				document.getElementById('co2-sub-label').innerHTML = '&nbsp;today';
			} else {
				el.innerHTML = Math.floor(val);
				document.getElementById('co2-label').innerHTML = 'ppm';
				document.getElementById('co2-sub-label').innerHTML = '&nbsp (parts per million)';
			}
		}
		if(this.tag == 'sealevel'){
			let val = dp['diff'];
			if(val == 'No data' || isNaN(val)){
				document.getElementById('s-depth-ft').innerHTML = '';
				el.innerHTML = 'lower';
				document.getElementById('sea-label').innerHTML = 'than';
				document.getElementById('sea-sub-label').innerHTML = '&nbsp;today';
				document.getElementById('sea-sym').innerHTML = '';
				return;
			} else {
				let ft = val * 3.2808
				//el.innerHTML = Math.floor(val);
				el.innerHTML = val.toFixed(1);
				//document.getElementById('s-depth-ft').innerHTML = Math.floor(ft);
				document.getElementById('s-depth-ft').innerHTML = ft.toFixed(1);
				document.getElementById('sea-label').innerHTML = 'm relative';
				document.getElementById('sea-sub-label').innerHTML = '&nbsp to today';
				document.getElementById('sea-sym').innerHTML = 'feet';
			}
		}
		if(this.tag == 'population'){
			//el.innerHTML = val;
			let val = dp[1];
			if (val === 0){
				el.innerHTML = val.toFixed(0);
				document.getElementById('pop-denom').innerHTML = '';
			} else if(val < 1000000){
				let d = val / 1000;
				el.innerHTML = d.toFixed(0);
				document.getElementById('pop-denom').innerHTML = 'thousand';
			} else if (val < 1000000000){
				let d = val / 1000000;
				el.innerHTML = d.toFixed(0);
				document.getElementById('pop-denom').innerHTML = 'million';
			} else if (val > 999999999){
				let d = val / 1000000000  	;
				el.innerHTML = d.toFixed(1);
				document.getElementById('pop-denom').innerHTML = 'billion';
			} else { // no data
        el.innerHTML = '< 10';
        document.getElementById('pop-denom').innerHTML = 'thousand';
      }
		}
	}
}

class Dashboard{

	constructor(){
		this.dashboardItems = [];
		this.dashboardItems.push(new DashboardItem('data/temperature.json', 'temperature', 0.0));
		this.dashboardItems.push(new DashboardItem('data/co2.json', 'co2', 0.0));
		this.dashboardItems.push(new DashboardItem('data/sealevel.json', 'sealevel', 0.0));
		this.dashboardItems.push(new DashboardItem('data/population.json', 'population', 0.0, false));
	}

	init(){
		utils.addBorderSvg('display');
	}

	update(t){
		for(let i = 0; i < this.dashboardItems.length; i++){
			this.dashboardItems[i].query(t);
		}
	}
}

// module.exports = Dashboard;
