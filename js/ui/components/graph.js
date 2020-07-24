// const d3 = require('d3');
// const path = require('path');
// const utils = require(path.resolve('app/js/utils'))
// const {ipcRenderer} = require('electron');

const PRESENT_VALUE_MIN = 18;
const PRESENT_VALUE_MAX = 53;

const MAX_ICE_AGE = 110291;

const MIN_LOCATOR_LEFT = 81;
const MAX_LOCATOR_LEFT = 340;

const DEFAULT_GRAPH_TIMELINE = [
	"110,000",
	"85,000",
	"25,000",
	"10,000"
]

class Graph {

	constructor(sourceFile, tag, args){
		if(tag){
			this.sourceFile = requireJSON(sourceFile)[tag];
		} else {
			this.sourceFile = requireJSON(sourceFile);
		}
		this.args = JSON.parse(JSON.stringify(args));
		this.svg = null;
		this.element = args.element;
		this.data = JSON.parse(JSON.stringify(this.sourceFile.data));
		//console.log(this.data);
		if(this.sourceFile.presentValue){
			this.presentValue = this.sourceFile.presentValue;
		} else {
			this.presentValue = 'none';
		}
		//console.log(this.sourceFile.presentValue);
		this.range = this.sourceFile.range;
		this.actualRange = this.getActualRange(this.data);
		if(this.presentValue != 'none'){
			this.calculatePresentValue();
		}
		this.x = d3.scaleTime().range([0, args.width * utils.currentScale().width]);
		this.y = d3.scaleLinear().range([args.height * utils.currentScale().height, 0]);
		//this.y = d3.scaleLinear().range([args.height * utils.currentScale().height, 0]).domain(0, d3.max(this.data[1]));
		//this.y = d3.scaleLinear().range([10, 0]);
		//this.x = d3.scaleTime().range([0, 655 * utils.currentScale().width]);
		//this.y = d3.scaleLinear().range([120 * utils.currentScale().height, 0]);
		this.numTicks = args.numTicks;
		this.ticksX = args.ticksX;
		this.ticksY = args.ticksY
		this.tickSize = args.tickSize;

		this.createPath();
		this.createErrorPath();

		this.position = 0.0;
		this.locatorPosition = 0.0;
		this.bBox = null;

		var _this = this;
		$(document).on('data', function(e, data) {
			//console.log('Listened to data in Graph', data);
			_this.dataReceived(e, data);
    });
		// ipcRenderer.on('data', (e, data) => );
		//this.createGraph()
	}

	getActualRange(data){
		let min = 10000000;
		let max = -10000000;
		for(let i = 0; i < data.length; i++){
			if(data[i][1] < min){
				min = data[i][1];
			}
			if(data[i][1] > max){
				max = data[i][1];
			}
		}
		return {'min': min, 'max': max};
	}

	dataReceived(e, data){
		this.calculateLocatorPosition(data);
	}

	/*
	Calculate the graphs locator position based in ice age. Set to 'none' if greater than 110000.
	*/

	calculateLocatorPosition(data){
		if(data.name === 'timescale') {
			if(data.data.iceAge > 110000){
				this.locatorPosition = 'none';
			} else {
				this.locatorPosition = 1.0 - data.data.iceAge / MAX_ICE_AGE;
			}
		}
	}

	getDepth(age){

	}

	createPath(){
		this.valueLine = d3.line()
			.x(d => this.x(d[0]))
			.y(d => this.y(d[1]));

		this.dataLine = this.valueLine(this.data);
	}

	createErrorPath(){
		this.errorData = [];

		/*
		Create error data by multiplying data by it's corresponding +/- error.
		*/

		for(let i = 0; i < this.data.length; i++){
			this.errorData.push([this.data[i][0], this.data[i][1] + (this.data[i][1] * (this.data[i][2] / 100.0))]);
		}
		for(let i = this.data.length - 1; i > -1 ; i--){
			this.errorData.push([this.data[i][0], this.data[i][1] + (this.data[i][1] * -(this.data[i][2] / 100.0))]);
		}

		this.valueLineError = d3.line()
			.x(d => this.x(d[0]))
			.y(d => this.y(d[1]));

		this.errorLine = this.valueLineError(this.errorData);
	}

	calculatePresentValue(){
		//let totalValueRange = this.range[1] - this.range[0];
		let totalValueRange = this.actualRange.max - this.actualRange.min;
		//this.presentValuePct = 1.0 - (this.presentValue - this.range[0]) / totalValueRange;
		this.presentValuePct = 1.0 - (this.presentValue - this.actualRange.min) / totalValueRange;
		let totalPositionRange = PRESENT_VALUE_MAX - PRESENT_VALUE_MIN;
		this.presentValuePosition = PRESENT_VALUE_MIN + (totalPositionRange * this.presentValuePct);
	}

	config(){

	}

	makeXGridLines(ctx){
		return d3.axisBottom(ctx.x).ticks(ctx.ticksX);
	}

	makeYGridLines(ctx){
		return d3.axisLeft(ctx.y).ticks(ctx.ticksY);
	}

	createGraph(){

		this.drawBG();

		this.x.domain([this.sourceFile.domain[0], this.sourceFile.domain[1]]);
		this.y.domain([this.sourceFile.range[0], this.sourceFile.range[1]]);
		//this.y.domain([this.actualRange.min, this.actualRange.max]);

		d3.select(this.element).selectAll("*").remove();

		this.svg = d3.select(this.element)
			.append("g")
			.attr("transform", "translate(25, 10)");

		this.svg.append("path")
			.data([this.errorData])
			.attr("id", "graph-path")
			.attr("class", this.args.errorLineClass)
			.attr("d", this.valueLineError)

		this.svg.append("path")
			.data([this.data])
			.attr("class", this.args.lineClass)
			.attr("d", this.valueLine)

		let graphDesc = document.getElementById("graph-desc")
		if(graphDesc != null){
			graphDesc.innerHTML = this.sourceFile.description;
		}
		if(this.args.titleChange){
			let graphTitle = document.getElementById("graph-title");
			if(graphTitle != null){
				graphTitle.innerHTML = this.sourceFile.title;
			}
		}

		if(this.args.element == '#graph-display-svg'){
			this.updateYDataLabel();

			/*
			Disabled. Update Y axis labels.
			*/
			//this.updateYAxisLabels();
		}

		if(this.args.presentValueTag != 'none'){
			let presentValueEl = document.getElementById('present-value-' + this.args.presentValueTag);
			if(this.presentValuePosition){
				let graphBoundingBox = document.getElementById('graph').getBoundingClientRect();
				let pathBoundingBox = document.getElementById('graph-path').getBoundingClientRect();
				let pathDiff = pathBoundingBox.bottom - pathBoundingBox.top;
				if(this.args.presentValueTag != "none"){
					presentValueEl.style.top = (pathDiff * this.presentValuePct) + (pathBoundingBox.top - graphBoundingBox.top) + 'px';
					presentValueEl.style.display = 'block';
				}
			} else {
				presentValueEl.style.display = 'none';
			}
		}

		if(this.sourceFile.graphTimeline){
			this.createGraphTimeline(true);
		} else {
			this.createGraphTimeline(false)
		}

		this.updateLocator();

	}

	createGraphTimeline(fromSource){
		let timelineSource = DEFAULT_GRAPH_TIMELINE;
		if(fromSource){
			timelineSource = this.sourceFile.graphTimeline;
		}
		document.getElementById('story-graph-label-1').innerHTML = timelineSource[0];
		document.getElementById('story-graph-label-2').innerHTML = timelineSource[1];
		document.getElementById('story-graph-label-4').innerHTML = timelineSource[2];
		document.getElementById('story-graph-label-5').innerHTML = timelineSource[3];
	}

	updateYDataLabel(){
		let graphYLabel = document.getElementById('graph-y-label');
		if(graphYLabel != null){
			graphYLabel.innerHTML = this.sourceFile.yLabel;
		}
	}

	updateYAxisLabels(){
		let lowNum = this.range[0];
		if(lowNum > 1000){
			lowNum = lowNum / 1000000000;
		}
		document.getElementById('graph-y-label-bottom').innerHTML = lowNum.toFixed(1);
		let midNum = this.range[0] + ((this.range[1] - this.range[0]) / 2);
		if(midNum > 1000){
			midNum = midNum / 1000000000;
		}
		document.getElementById('graph-y-label-middle').innerHTML = midNum.toFixed(1);
		let highNum = this.range[1];
		if(highNum > 1000){
			highNum = highNum / 1000000000;
		}
		document.getElementById('graph-y-label-top').innerHTML = highNum.toFixed(1);
	}

	attachGraph(){

	}

	drawBG(){
		let canvas = document.getElementById(this.args.canvas);
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0,0, canvas.width, canvas.height);
		//ctx.fillStyle = 'rgb(13,35,38)';
		ctx.fillStyle = 'rgb(2, 51, 57)';
		ctx.fillRect(5,0, canvas.width, canvas.height - 5);
		ctx.strokeStyle = 'rgb(0,0,0)';
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.lineTo(canvas.width, 5);
		ctx.moveTo(0, (canvas.height / 4));
		ctx.lineTo(canvas.width, (canvas.height / 4));
		ctx.moveTo(0, canvas.height / 2 - 5);
		ctx.lineTo(canvas.width, canvas.height / 2 - 5);
		ctx.moveTo(0, (canvas.height / 4) * 3 - 5);
		ctx.lineTo(canvas.width, (canvas.height / 4) * 3 - 5);
		ctx.moveTo(canvas.width - 5, 0);
		ctx.lineTo(canvas.width - 5, canvas.height);
		ctx.moveTo(0, canvas.height - 10);
		ctx.lineTo(canvas.width, canvas.height - 10);
		ctx.stroke();

		/*
		Disabled. Draw dash marks on y axis label.
		*/
		// ctx.strokeStyle = 'rgb(16,132,153)';
		// ctx.beginPath();
		// ctx.moveTo(0, 5);
		// ctx.lineTo(10, 5);
		// ctx.moveTo(0, canvas.height / 2 - 5);
		// ctx.lineTo(10, canvas.height / 2 - 5);
		// ctx.moveTo(0, canvas.height - 10);
		// ctx.lineTo(10, canvas.height - 10);
		// ctx.stroke();

		let base = 25;
		let add = ((canvas.width - base) * 0.892) / 4;
		for(let i = 0; i < 5; i++){
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.beginPath();
			ctx.moveTo(base + (add * i), 0);
			ctx.lineTo(base + (add * i), canvas.height);
			ctx.stroke();
			ctx.strokeStyle = 'rgb(16,132,153)';
			ctx.beginPath();
			ctx.moveTo(base + (add * i), canvas.height - 10);
			ctx.lineTo(base + (add * i), canvas.height);
			ctx.stroke();
		}
	}

	draw(p){
		this.position = p;

		/*
		Draw locator based on calculated position. This will be set to 'none' if ice age is greater than 110000.
		*/

		this.updateLocator();

		var graphDesc = document.getElementById("graph-desc")
		if(graphDesc != null){
			graphDesc.innerHTML = this.sourceFile.description;
		}
	}

	updateLocator(){
		let locatorElem = document.getElementById(this.args.locator);
		if(locatorElem){
			if(this.locatorPosition == 'none'){
				locatorElem.style.display = 'none';
			} else {
				let locatorLeft = this.args.locatorMin + ((this.args.locatorMax - this.args.locatorMin) * this.locatorPosition);
				locatorElem.style.left = locatorLeft + 'px';
				locatorElem.style.display = 'block';
			}
		}
	}

}

// module.exports = Graph;
