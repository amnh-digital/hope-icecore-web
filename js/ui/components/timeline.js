// const path = require('path');
// const EventEmitter = require('events').EventEmitter;
// const Story = require(path.resolve('app/js/ui/components/story'));
// const Analytics = require(path.resolve('app/js/ui/components/analytics'));

const Y_POS = 0.874
const SHIFT_FACTOR = 1.0 - (3000 / 3053);

class TimelineMarker {

	constructor(){
		this.height = 0.03;
	}

	draw(p){
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "#FFFF00";
		ctx.fillRect(canvas.width * p, canvas.height * 0.95, canvas.width * 0.015, canvas.height * this.height);
	}

}

function scaleYearsAgo(yearsAgo){
	var y = parseInt(yearsAgo.replace(/,/g,"")) / 110000.0;
	return y;
}

function scaleDepth(depth){
	var y = parseInt(depth.replace(/,/g,"")) / 3000.0;
	return y;
}

class TimelineHotspot {

	/*
	*/

	constructor(args){
		this.minX = 0.0;
		this.maxX = 0.0;
		if(args.start){
			//this.minX = 1.0 - scaleYearsAgo(args.start);
			this.minX = ((1.0 - scaleDepth(args.start)) * (0.90 - SHIFT_FACTOR)) + 0.05 + SHIFT_FACTOR;
		}
		if(args.end){
			//this.maxX = 1.0 -scaleYearsAgo(args.end);
			this.maxX = ((1.0 - scaleDepth(args.end)) * (0.90 - SHIFT_FACTOR)) + 0.05 + SHIFT_FACTOR;
		}
		this.width = this.maxX - this.minX;
		this.height = 0.02;
		this.activeColor = 'rgb(255, 255, 255)';
		this.inactiveColor = 'rgb(81, 184, 72)';
		this.attractColor = 'rgb(20, 134, 154)';
		this.bgColor = '#008499';
		this.activated = false;
	}

	isInside(p){
		//console.log('Hotspot checking ' + p + ' against ' + this.minX + ' and ' + this.maxX + '.');
		if(p > this.minX & p < this.maxX){
			this.activated = true;
			return true;
		}
		this.activated = false;
		return false;
	}

	draw(all=false, attract=false, pct = 0.0){
		if((all == false) && (this.activated == false) && (attract == false)){
			return;
		}
		if(attract == true){
			var canvas = document.getElementById("canvas-attract");
		} else if(all == true){
			var canvas = document.getElementById("canvas-tl");
		} else {
			var canvas = document.getElementById("canvas");
		}
		var ctx = canvas.getContext("2d");
		if(this.activated && !attract){
			ctx.save();
			ctx.fillStyle = this.bgColor;
			//ctx.fillRect((canvas.width * this.minX) - 15.0, (canvas.height * 0.855) - 15.0, (canvas.width * this.width) + 30.0, (canvas.height * this.height) + 30.0;);
			let rectX = (canvas.width * this.minX) - 15.0;
			let rectY = (canvas.height * Y_POS) - 15.0;
			let rectW = (canvas.width * this.width) + 30.0;
			let rectH = (canvas.height * this.height) + 30.0;
			let rectR = 10;
			ctx.lineJoin = "round";
			ctx.lineWidth = rectR;
			ctx.strokeRect(rectX + (rectR / 2), rectY+(rectR / 2), rectW - rectR, rectH - rectR);
			ctx.fillRect(rectX + (rectR / 2), rectY+(rectR / 2), rectW - rectR, rectH - rectR);
			ctx.restore();
		}
		if(this.activated){
			ctx.fillStyle = this.activeColor;
			ctx.strokeStyle = this.activeColor;
		} else {
			ctx.fillStyle = this.inactiveColor;
			ctx.strokeStyle = this.inactiveColor;
		}
		if(attract){
			let rVal = Math.floor(20 + ((81 - 20) * pct));
			let gVal = Math.floor(134 + ((184 - 134) * pct));
			let bVal = Math.floor(72 + ((154 - 72) * (1.0 - pct)));
			//ctx.fillStyle = 'rgb(' + rVal + ', ' + gVal + ', ' + bVal + ')';
			//ctx.fillStyle = 'rgb(255, 0, 0)';
			//ctx.strokeStyle = 'rgb(' + rVal + ', ' + gVal + ', ' + bVal + ')';
			let color = 'rgb(' + rVal +', ' + gVal + ', ' + bVal + ')';
			ctx.strokeStyle = color;
		}
		//ctx.fillRect(canvas.width * this.minX, canvas.height * 0.855, canvas.width * this.width, canvas.height * this.height);
		let scaleY = 1.7;
		ctx.save();
		ctx.scale(1, scaleY);
		ctx.beginPath();
		//ctx.ellipse(canvas.width * this.minX, canvas.height * (0.855 + (this.height / 2)), canvas.width * 0.003, canvas.height * (this.height / 2), 0, 2 * Math.PI, 0);
		ctx.arc(canvas.width * this.minX, (canvas.height * (Y_POS + (this.height / 2)) / scaleY), canvas.width * 0.003, 2.5 * Math.PI, 1.5 * Math.PI);
		ctx.stroke()
		//console.log('Left arc at ' + canvas.width * this.minX);
		//console.log(`${this.minX} | ${this.width}`);
		for(let i = (canvas.width * this.minX); i < (canvas.width * (this.width + this.minX)); i += 0.5){
			let f = Math.floor(i);
			ctx.beginPath();
			ctx.arc(f, (canvas.height * (Y_POS + (this.height / 2)) / scaleY), canvas.width * 0.003, 1.5 * Math.PI, 2.5 * Math.PI);
			ctx.stroke();
		}
		ctx.stroke();
		ctx.restore();
	}
}

class TimelineLabel {

	constructor(args){
		this.totalTime = 110000.0;
		this.totalDepth = 3000.0;
		this.textColor = '#bfbfbf';
		this.type = args.type;
		this.val = args.val;
		if(this.type == 'time'){
			this.xPosition = 1.0 - parseInt(this.val.replace(/,/g,"")) / this.totalTime;
			//console.log('Label xPosition:' + this.xPosition + ' from ' + parseInt(this.val));
			this.yPosition = 0.8;
			this.firstLine = this.val;
			this.secondLine = "years ago";
		} else {
			this.xPosition = 1.0 - parseInt(this.val.replace(/,/g,"")) / this.totalDepth;
			this.yPosition = 0.92;
			this.firstLine = this.val + " meters";
			this.secondLine = "below surface";
		}
	}

	draw(p){
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = '#bfbfbf';
		ctx.font = "20px Arial";
		ctx.fillText(this.firstLine, canvas.width * this.xPosition, canvas.height * this.yPosition);
		ctx.fillText(this.secondLine, canvas.width * (this.xPosition - 0.005), canvas.height * (this.yPosition + 0.02));
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#bfbfbf';
		ctx.beginPath();
		if(this.type == 'time'){
			ctx.moveTo(canvas.width * (this.xPosition + 0.02), canvas.height * (this.yPosition + 0.025));
			ctx.lineTo(canvas.width * (this.xPosition + 0.02), canvas.height * (Y_POS));
		} else {
			ctx.moveTo(canvas.width * (this.xPosition + 0.025), canvas.height * (0.88));
			ctx.lineTo(canvas.width * (this.xPosition + 0.025), canvas.height * (0.9));
		}
		ctx.stroke();
	}
}

class Timeline {

	/*
	Timeline takes a y value as a percentage which determinces it's
	horizontal position on the screen.
	*/

	constructor(y){
		// super()
		this.y = y;
		this.width = 1.0;
		this.height = 0.03;
		this.startX = 0.05;
		this.startY = this.y;
		this.endX = 0.95;
		this.endY = this.startY + this.height;
		this.length = this.endX - this.startX;
		this.timelineMarker = new TimelineMarker();
		this.hotspots = [];
		this.stories = [];
		this.activeHotspot = null;
		this.labels = [];
		this.timelineX = 0.05;
		this.timelineWidth = 0.95;
	}

	addStory(args){
		this.hotspots.push(new TimelineHotspot(args));
		//args.startScaled = 1.0 - (scaleDepth(args.start) * (this.timelineWidth - this.timelineX) + this.timelineX);
		//args.endScaled = 1.0 - (scaleDepth(args.end) * (this.timelineWidth - this.timelineX) + this.timelineX);
		args.startScaled = ((1.0 - scaleDepth(args.start)) * (0.90 - SHIFT_FACTOR)) + 0.05 + SHIFT_FACTOR;
		args.endScaled = this.maxX = ((1.0 - scaleDepth(args.end)) * (0.90 - SHIFT_FACTOR)) + 0.05 + SHIFT_FACTOR;
		this.stories.push(new Story(args));
	}

	addLabel(args){
		this.labels.push(new TimelineLabel(args));
	}

	checkHotspots(p){
		var bInsideHotspot = false
		for(let i = 0; i < this.hotspots.length; i++){
			if(this.hotspots[i].isInside(p)){
				//console.log('Inside hotspot:' + i);
				bInsideHotspot = true;
				if(this.activeHotspot != i){
					this.activeHotspot = i;
					this.emit('hotspot:enter', this.hotspots[i]);

					/*
					Send analytics data.
					*/
					Analytics.push('storyOpen', this.activeHotspot + 1);
				}
				this.stories[i].compose(p);
				this.currentStory = this.stories[i];
			}
		}
		if(!bInsideHotspot & this.activeHotspot != null){
			this.emit('hotspot:exit');
			this.activeHotspot = null;

			/*
			Send analytics data.
			*/
			Analytics.push('storyClose', this.activeHotspot + 1);
		}
	}

	emit(name, value){
		$(document).trigger(name, [value]);
	}

	positionUpdate(p){
		p = p * 0.90 + 0.05;
		this.checkHotspots(p);
	}

	drawDepthMarkings(canvas, ctx){
		//Shift start position right by 3000 3060th
		let markingsStartX = this.startX + SHIFT_FACTOR;
		let markingsEndX = this.endX;
		let length = markingsEndX - markingsStartX;
		let numberOfDivisions = 30;
		let lengthOfDivisions = length / numberOfDivisions;
		ctx.strokeStyle ="var(--icecore-primary-color)";
		ctx.fillStyle = ctx.strokeStyle;
		ctx.font = '16px BalanceOffcPro';
		for(let i = 1; i < numberOfDivisions; i++){
			let xPos = canvas.width * (markingsStartX + (lengthOfDivisions * i));
			let yPos = canvas.height * this.endY;
			ctx.beginPath();
			if(i % 5 === 0){
				let depth = 500 * (6 - (i / 5));
				ctx.lineWidth = 3;
				ctx.fillText(depth + ' m', xPos - (ctx.measureText(depth).width / 2), yPos + (canvas.height * (this.endY - this.startY)));
			} else {
				ctx.lineWidth = 1;
			}
			ctx.moveTo( Math.floor(xPos)+0.5, yPos);
			ctx.lineTo( Math.floor(xPos)+0.5, yPos + (canvas.height * 0.01));
			ctx.stroke();
		}
	}

	drawYBPMarkings(canvas, ctx){
		//Shift start position right by 3000 3060th
		let markingsStartX = this.startX;
		let markingsEndX = this.endX;
		let ybps = [
			/*{'ybp': '110,000', 'depth': 2808.0, 'divisions': 0},*/
			{'ybp': '110,000', 'depth': 2808.0, 'divisions': 0},
			{'ybp': '50,000', 'depth': 2430.0, 'divisions': 24},
			{'ybp': '25,000', 'depth': 2013.0, 'divisions': 10},
			{'ybp': '10,000', 'depth': 1564.83, 'divisions': 6},
			{'ybp': '5,000', 'depth': 991.91},
			{'ybp': '2,500', 'depth': 577.15},
			{'ybp': '1,000', 'depth': 269.54}
		];

		ctx.strokeStyle ="rgb(16, 132, 153)";
		ctx.fillStyle = ctx.strokeStyle;
		ctx.font = '16px BalanceOffcPro';
		let maxDepth = 3053.0;
		for(let i = 0; i < ybps.length; i++){
			let xPos = markingsStartX + (1.0 - (ybps[i].depth / maxDepth)) * 0.9;
			ybps[i].xPos = xPos;
			let yPos = canvas.height * this.startY;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo( Math.floor(canvas.width * xPos)+0.5, yPos);
			ctx.lineTo( Math.floor(canvas.width * xPos)+0.5, yPos - (canvas.height * 0.02));
			ctx.stroke();
			ctx.fillText(ybps[i].ybp + ' yrs.', (canvas.width * xPos) - (ctx.measureText(ybps[i].ybp).width / 2), yPos - (canvas.height * 0.03));
		}
		for(let i = 0; i < 4; i++){
			let firstX = markingsStartX;
			if(i > 0){
				firstX = ybps[i - 1].xPos;
			}
			let dist = ybps[i].xPos - firstX;
			let gap = dist / ybps[i].divisions;
			for(let j = 0; j < ybps[i].divisions; j++){
				ctx.lineWidth = 1.0;
				ctx.beginPath;
				ctx.moveTo( Math.floor(canvas.width * (firstX + (gap * j)))+0.5, canvas.height * this.startY);
				ctx.lineTo( Math.floor(canvas.width * (firstX + (gap * j)))+0.5, canvas.height * (this.startY - 0.01));
				ctx.stroke();
				ctx.lineWidth = 1.0;
			}
		}
	}

	draw(p){
		this.positionUpdate(p);
		for(let i = 0; i < this.hotspots.length; i++){
			this.hotspots[i].draw(false);
		}
		if(this.currentStory){
			this.currentStory.draw(p);
		}
	}

	drawAttract(pct){
		var canvas = document.getElementById("canvas-attract");
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.rect(0,0, 100, 100);
		ctx.fillStyle = 'rgb(2, 51, 57)';
		//ctx.rect(0, 0, canvas.width, canvas.height);
		for(let i = 0; i < this.hotspots.length; i++){
			this.hotspots[i].draw(false, true, pct);
		}
	}

	drawBG(){
		var canvas = document.getElementById("canvas-tl");
		var ctx = canvas.getContext("2d");
		ctx.strokeStyle ="rgb(0, 132, 153)";
		//ctx.fillRect(0, canvas.height * this.y, canvas.width * this.width, canvas.height * this.height);
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.ellipse(canvas.width * this.timelineX, canvas.height * (this.y + (this.height / 2)), canvas.width * 0.006,canvas.height * (this.height / 2), 0, 0.5 * Math.PI, 1.5 * Math.PI);
		ctx.stroke();
		ctx.moveTo(canvas.width * this.timelineX, canvas.height * this.y);
		ctx.lineTo(canvas.width * this.timelineWidth, canvas.height * this.y);
		ctx.stroke();
		ctx.moveTo(canvas.width * this.timelineX, canvas.height * (this.y + this.height));
		ctx.lineTo(canvas.width * this.timelineWidth, canvas.height * (this.y + this.height));
		ctx.stroke();
		ctx.beginPath();
    	ctx.ellipse(canvas.width * this.timelineWidth, (canvas.height * (this.y + (this.height / 2))), canvas.width * 0.006,canvas.height * (this.height / 2), 0, 0.5 * Math.PI, 1.5 * Math.PI, true);
		ctx.stroke();
		this.drawDepthMarkings(canvas, ctx);
		this.drawYBPMarkings(canvas, ctx);
		for(let i = 0; i < this.hotspots.length; i++){
			this.hotspots[i].draw(true);
		}
	}

}

// module.exports = Timeline;
