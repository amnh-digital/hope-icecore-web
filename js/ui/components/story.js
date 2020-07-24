'use strict'

// const path = require('path');
// const fs = require('fs');
// const Graph = require(path.resolve('app/js/ui/components/graph'));

let graphHeight = 290;

let storyGraphArgs = {
	"element": "#story-graphic-graph",
	"canvas": "story-graphic-graph-canvas",
	"width": 645,
	"height": graphHeight,
	"rectWidth": "95%",
	"rectHeight": "85%",
	"numTicks": 5,
	"ticksX" : 1,
	"ticksY" : 5,
	"ticksXPos": 330,
	"tickSize": 10,
	"lineClass": 'story-line-orange',
	"errorLineClass": 'story-line-error-orange',
	"locator": "story-locator",
	"locatorMin": 133,
	"locatorMax": 751,
	"presentValueTag": "none"
}

let graphTitleColors = {
	'orange': 'rgb(242, 103, 34)',
	'blue': 'rgb(16, 132, 153)',
	'violet': 'rgb(172, 77, 157)',
	'yellow': 'rgb(188, 182, 55)'
}

class Story{

	constructor(args){
		this.dir = null;
		this.files = []
		this.start = args.startScaled;
		this.end = args.endScaled;
		this.imgId = 'story-graphic-img';
		this.mode = 'image';
		this.graphs = [];
		this.titleColors = [];
		this.titles = [];
		if(args.directory){
			this.dir = 'assets/stories/' + args.directory;
			this._load();
		}
		if(args.imgId){
			this.imgId = args.imgId;
		}
	}

	_load(){
		console.log(`Reading contents = ${this.dir}`)
		this.loadConfig('config.json');

		if (this.config.image) {
			this.files.push(new Image());
	    this.files[this.files.length - 1].src = this.dir + '/' + this.config.image;
		}

		if (this.config.frames) {
			var frames = this.config.frames;
			for (var i=0; i<frames.length; i++) {
				this.files.push(new Image());
		    this.files[this.files.length - 1].src = this.dir + '/' + frames[i];
			}
		}

		// fs.readdir(this.dir, (err, items) => {
    //   if (items){
    //     for(let i = 0; i < items.length; i++){
    //       //console.log(items[i]);
    //       if(items[i].endsWith('.json')){
    //         this.loadConfig(items[i]);
    //       } else {
    //         //console.log(items[i]);
    //
    //       }
    //     }
    //   }
		// })
	}

	loadConfig(file){
		this.config = requireJSON(this.dir + '/' + file);
		if(this.config.graphs != null){
			this.mode = 'graph';
			//console.log('loading graph story.');
			//let g = this.config.graphs[0];
			//this.graphs = new Graph(path.resolve(g.sourceFile), g.tag, storyGraphArgs);
			this.numGraphs = this.config.graphs.length;
			for(let i =0; i < this.numGraphs; i++){
				let g = this.config.graphs[i];
				storyGraphArgs.lineClass = 'story-line-' + this.config.graphs[i].color;
				storyGraphArgs.errorLineClass = 'story-line-error-' + this.config.graphs[i].colorError;
				this.titleColors[i] = graphTitleColors[this.config.graphs[i].color];
				this.titles[i] = this.config.graphs[i].tag;
				if(this.numGraphs > 1){
					storyGraphArgs.element = '#story-graphic-graph-' + (i + 1);
					storyGraphArgs.height = graphHeight / 2;
					storyGraphArgs.presentValueTag = 'none';
				} else {
					storyGraphArgs.element = '#story-graphic-graph';
					storyGraphArgs.height = graphHeight;
					storyGraphArgs.presentValueTag = 'story';
				}
				g.tag = g.tag.toLowerCase().replace(/\s/g, '');
        		g.tag = g.tag.replace(/₂/g,'2'); console.warn('workaround');
				//console.log(g.tag);
				this.graphs.push(new Graph(g.sourceFile, g.tag, storyGraphArgs));
			}
		}
	}

	compose(p){
		if(this.config){
			var title = document.getElementById('story-title');
			if(title.innerHTML != this.config.text.title){
				title.innerHTML = this.config.text.title;
			}
			var body = document.getElementById('story-body');
			if(body.innerHTML != this.config.text.body){
				body.innerHTML = this.config.text.body;
			}
			var description = document.getElementById('story-description');
			if(description.innerHTML != this.config.text.description){
				description.innerHTML = this.config.text.description;
			}
			var credit = document.getElementById('story-credit');
			if(credit.innerHTML != this.config.text.credit){
				credit.innerHTML = this.config.text.credit;
			}
			if(this.mode == 'image'){
				this.composeImage(p);
			} else {
				this.composeGraph(p);
			}
		}
	}

	composeImage(p){
		let image = document.getElementById(this.imgId);
		let pct = (p - this.start) / (this.end - this.start);
		let imageIndex = Math.floor(this.files.length * pct);
		if(imageIndex < 0){
			imageIndex = 0;
		}
		if(imageIndex > this.files.length - 1){
			imageIndex = 0;
		}
		image.src = this.files[imageIndex].src;
		document.getElementById('story-graphic-img').style.display = 'block';
		document.getElementById('story-graphic-graph').style.display = 'none';
		document.getElementById('story-graph-x-label').style.display = 'none';
		document.getElementById('story-graph-y-label').style.display = 'none';
		document.getElementById('story-graphic-graph-canvas').style.display = 'none';
		document.getElementById('story-graphic-graph-single').style.display = 'none';
		document.getElementById('story-graphic-graph-double').style.display = 'none';
	}

	composeGraph(p){
		if(this.numGraphs > 1){
			document.getElementById('story-graphic-graph-single').style.display = 'none';
			document.getElementById('story-graphic-graph-double').style.display = 'block';
		} else {
			document.getElementById('story-graphic-graph-double').style.display = 'none';
			document.getElementById('story-graphic-graph-single').style.display = 'block';
		}
		for(let i = 0; i < this.numGraphs; i++){
			this.graphs[i].createGraph();
			if(this.numGraphs > 1){
				document.getElementById('story-graph-title-bg-' + (i+1)).style.background = this.titleColors[i];
				document.getElementById('story-graph-title-bg-' + (i+1)).innerHTML = this.titles[i];
			}
		}
		document.getElementById('story-graphic-img').style.display = 'none';
		document.getElementById('story-graphic-graph').style.display = 'block';
		document.getElementById('story-graph-x-label').style.display = 'block';
		document.getElementById('story-graph-y-label').style.display = 'block';
		document.getElementById('story-graphic-graph-canvas').style.display = 'block';
	}

	draw(p){
		if(this.mode == 'graph'){
			for(let i = 0; i < this.numGraphs; i++){
				this.graphs[i].draw();
			}
		}
	}

}

// module.exports = Story;
