'use strict'

class Arrow {

	constructor(args){
		this.xOrigin = 0.1;
		this.yOrigin = 0;
		if(args.xOrigin){
			this.xOrigin = args.xOrigin;
		}
		if(args.yOrigin){
			this.yOrigin = args.yOrigin;
		}
	}

	draw(p){
		p = p * 0.90 + 0.05;
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		var startX = canvas.width * this.xOrigin;
		var startY = canvas.height * this.yOrigin;
		//var endX = canvas.width * (p + 0.0075);
		var endX = canvas.width * p;
		var endY = canvas.height * 0.87;
		var yPortion = (endY - startY) / 4;
		var yPoint1 = endY - yPortion;
		//var yPoint2 = yPoint1 + yPortion;
		//var midY = startY;

    var w1=.75,w2=3;
    ctx.strokeStyle = '#008499';
    ctx.fillStyle = '#008499';
    ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(startX-w1, startY);
		ctx.lineTo(endX-w2, yPoint1);
    ctx.lineTo(endX-w2, endY);
    ctx.lineTo(endX+w2, endY);
    ctx.lineTo(endX+w2, yPoint1);
    ctx.lineTo(startX+w1, startY);
    ctx.closePath();
    ctx.stroke();
		ctx.fill();

		/*
		ctx.beginPath();
		ctx.moveTo(canvas.width * this.xOrigin, canvas.height * this.yOrigin);
		ctx.bezierCurveTo(startX, endY, endX, startY, endX, endY);
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#d3b020';
		ctx.stroke();
		ctx.fillStyle = '#d3b020';
		ctx.beginPath();
		ctx.moveTo(endX, endY);
		ctx.lineTo(endX - 15, endY - 15);
		ctx.lineTo(endX + 15, endY - 15);
		ctx.fill();
		ctx.fillStyle = '#93852f';
		ctx.fillRect(canvas.width * (this.xOrigin - 0.025), canvas.height * (this.yOrigin - 0.01), canvas.width * 0.05, canvas.height * 0.01);
		*/
	}

}

// module.exports = Arrow;
