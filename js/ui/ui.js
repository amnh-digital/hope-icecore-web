// const path = require('path');
// const Timeline = require(path.resolve('app/js/ui/components/Timeline'));
// const Arrow = require(path.resolve('app/js/ui/components/arrow'));
// const Background = require(path.resolve('app/js/ui/components/background'));
// const config = require(path.resolve('app/js/ui/config'));
// const d3 = require('d3');
// const Graph = require(path.resolve('app/js/ui/components/graph'));
// const Dashboard = require(path.resolve('app/js/ui/components/dashboard'));
// const utils = require(path.resolve('app/js/utils'));
// const Attract = require(path.resolve('app/js/ui/components/attract'));
// const PerfectScrollbar = require('perfect-scrollbar');
// const SimpleScrollbar = require('simple-scrollbar');
// const Analytics = require(path.resolve('app/js/ui/components/analytics'));

const ATTRACT_TIMEOUT = 90000;
const GRAPH_CLOSE_THRESH = 0.01;

/*
Args passed to slide out graphs.
*/

let graphArgs = {
	"element": "#graph-display-svg",
	"canvas": "graph-canvas",
	"width": 275,
	"height": 130,
	"rectWidth": "85%",
	"rectHeight": "75%",
	"numTicks": 4,
	"ticksX": 3,
	"ticksY": 5,
	"ticksXPos": 130,
	"tickSize": 10,
	"lineClass": 'line',
	"errorLineClass": 'line-error',
	"locator": "locator",
	"locatorMin": 83,
	"locatorMax": 358,
	"presentValueTag": "main",
	"titleChange": true
}

class Ui {

	constructor(){
		this.timeline = new Timeline(0.869);
		for(let i = 0; i < config.stories.length; i++){
			this.timeline.addStory(config.stories[i]);
		}
		for(let i = 0; i < config.labels.length; i++){
			this.timeline.addLabel(config.labels[i]);
		}
		// this.timeline.on('hotspot:enter', this.openStory);
		// this.timeline.on('hotspot:exit', this.closeStory)
		var _this = this
		$(document).on('hotspot:enter', function(e, value) {
      _this.openStory(value);
    });
		$(document).on('change-view', function(e, value) {
      _this.closeStory(value);
    });

		this.arrow = new Arrow({'xOrigin': 0.493, 'yOrigin': 0.682});
		this.background = new Background();
		this.dashboard = new Dashboard();
		this.co2Graph = new Graph('data/co2.json', 'co2', graphArgs);
		this.tempGraph = new Graph('data/temperature.json', 'temperature', graphArgs);
		this.seaGraph = new Graph('data/sealevel.json', 'sealevel', graphArgs);
		this.popGraph = new Graph('data/population.json', 'population', graphArgs);
		this.currentGraphNum = null;
		this.currentGraph = null;
		this.graphNavClipPath = null;
		//this.attractOn = false;
		this.attractTimeout = null
		this.attract = new Attract();
	}

	init(){

		/*
		Enable graph nav.
		*/

		let graphNavChildren = document.getElementById('graph-nav').getElementsByTagName('div');
		for(let i = 0; i < graphNavChildren.length; i++){
			graphNavChildren[i].addEventListener('click', () => this.openGraph(i));
		}

		/*
		Enable info panel buttons.
		*/

		document.getElementById('info-button-1').onclick = () => this.openInfoPanel(1);
		document.getElementById('info-button-2').onclick = () => this.openInfoPanel(2);

		/*
		Enable close buttons on info panels.
		*/


		let infoPanelTabs = document.getElementsByClassName('info-panel-tab');
		for(let i = 0; i < infoPanelTabs.length; i++){
			infoPanelTabs[i].onclick = () => this.closeInfoPanel();
		}

		document.getElementById('modal-closer').onclick = () => this.closeInfoPanel();

		/*
		Add borders to diagonal divs.
		*/

		utils.addBorderSvg('display');
		utils.addBorderSvg('story');
		utils.addBorderSvg('graph-nav', false);
		utils.addBorderSvg('graph');
		utils.addBorderSvg('info-button-1');
		utils.addBorderSvg('info-button-2');
		utils.addBorderSvg('info-panel-1');
		utils.addBorderSvg('info-panel-2');

		/*
		Set up info panels. Info panels must be displayed during configuration.
		*/


		this.background.setImage();

		/*
		Close info panels.
		*/

		let panels = document.getElementsByClassName('info-panel');
		for(let i = 0; i < panels.length; i++){
			panels[i].style.display = 'none';
		}
		this.draw({'position': 0, 'velocity': 0});
		this.timeline.drawBG();

		/*
		* Start attract
		*/

		//this.setAttractTimeout();

		//this.ps = new PerfectScrollbar('#info-panel-2-scroll')

		/*
		Add event listener to body to stop attract when clicked.
		*/

		document.body.addEventListener('click', () => {
			if(this.attractOn == true){
				this.stopAttract();
			} else {
				this.setAttractTimeout();
			}
		}, true);
	}

	/*
	Draw UI elements that need to be updated when position changes.
	*/

	draw(p){

		/*
		if(this.graphOpenPosition){
			let diff = Math.abs(p.position - this.graphOpenPosition);
			if(diff > GRAPH_CLOSE_THRESH){
				this.closeGraph();
			}
		}
		*/

		if(this.openInfoPanelPosition){
			let diff = Math.abs(p.position - this.openInfoPanelPosition);
			if(diff > GRAPH_CLOSE_THRESH){
				this.closeInfoPanel();
			}
		}
		this.currentPosition = p.position;
		if(this.attractOn == true){
			this.stopAttract();
			this.setAttractTimeout();
			return;
		} else {
			this.setAttractTimeout();
		}
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,canvas.width, canvas.height);
		this.background.draw(p);
		this.timeline.draw(p.position);
		this.arrow.draw(p.position);
		if(this.currentGraph){
			this.currentGraph.draw(p.position);
		}
		// console.log(p)
	}

	drawAttractTimeline(pct){
		this.timeline.drawAttract(pct);
	}

	updateDashboard(t){
		this.dashboard.update(t);
	}

	openStory(){
		let story = document.getElementById('story');
		story.style.transform = 'translate(0,0)';
		//story.style.p = 'rect(0, 100vh, 100vh, 0vw)';
	}

	closeStory(){
		let story = document.getElementById('story');
		story.style.transform = 'translate(-43vw, 0)';
		//story.style.clip = 'rect(0, 100vw, 100vh, 41vw)';
	}

	clearGraphNav(){
		let navItems = document.getElementById('graph-nav').children;
		for(let i = 0; i < navItems.length; i++){
			navItems[i].classList.remove('graph-nav-item-sel');
			navItems[i].classList.remove('graph-nav-item-sel-a');
			navItems[i].classList.remove('graph-nav-item-sel-b');
			if(i < 4){
				document.getElementById('dashboard-item-' + i).classList.remove('dashboard-item-sel');
			}
		}
	}

	setGraphNavOpen(graphNum){
		let navItem = document.getElementById('graph-nav').getElementsByTagName('div')[graphNum];
		navItem.classList.add('graph-nav-item-sel');
	}

	openGraph(graphNum=1){
		if(graphNum == this.currentGraphNum){
			this.closeGraph();
			return;
		}
		this.clearGraphNav();
		this.setGraphNavOpen(graphNum);
		if(graphNum == 0){
			this.tempGraph.createGraph();
			this.currentGraph = this.tempGraph;
			if(this.graphNavClipPath != null){
				this.resetGraphNavCorner();
			}
		}
		if(graphNum == 1){
			this.co2Graph.createGraph();
			this.currentGraph = this.co2Graph;
			if(this.graphNavClipPath != null){
				this.resetGraphNavCorner();
			}
		}
		if(graphNum == 2){
			this.seaGraph.createGraph();
			this.currentGraph = this.seaGraph;
			if(this.graphNavClipPath != null){
				this.resetGraphNavCorner();
			}
		}
		if(graphNum == 3){
			this.popGraph.createGraph();
			this.currentGraph = this.popGraph;
			let graphNav = document.getElementById('graph-nav');
			this.graphNavClipPath = utils.getStyle(graphNav, 'clip-path');
			graphNav.style['clip-path'] = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
			utils.addBorderSvg('graph-nav', false);
		}
		document.getElementById('dashboard-item-' + graphNum).classList.add('dashboard-item-sel');
		let graph = document.getElementById('graph');
		graph.style.transform = 'translate(0vw, 0vh)';
		this.currentGraphNum = graphNum;
		this.setAttractTimeout();
		this.graphOpenPosition = this.currentPosition;

		/*
		Send analytics data.
		*/
		Analytics.push('graphOpen', graphNum + 1);
	}

	closeGraph(){
		/*
		let navItems = document.getElementById('graph-nav').children;
		for(let i = 0; i < navItems.length; i++){
			navItems[i].classList.remove('graph-nav-item-sel');
		}
		*/
		this.clearGraphNav();
		let graph = document.getElementById('graph');
		graph.style.transform = 'translate(22vw,0vh)';
		this.currentGraph = this.currentGraphNum = null;
		if(this.graphNavClipPath != null){
			this.resetGraphNavCorner();
		}
		this.setAttractTimeout();

		/*
		Send analytics data.
		*/
		Analytics.push('graphClose', this.currentGraphNum + 1);
	}

	resetGraphNavCorner(){
		let graphNav = document.getElementById('graph-nav');
		graphNav.style['clip-path'] = this.graphNavClipPath;
		utils.addBorderSvg('graph-nav', false);
		this.graphNavClipPath = null;
	}

	turnOnBlur(){
		let blurrables = document.getElementsByClassName('blurrable');
		for(let i = 0; i <blurrables.length; i++){
			blurrables[i].style.filter = 'blur(10px)';
		}
	}

	turnOffBlur(){
		let blurrables = document.getElementsByClassName('blurrable');
		for(let i = 0; i <blurrables.length; i++){
			blurrables[i].style.filter = "";
		}
	}

	openInfoPanel(num){
		this.closeInfoPanel();
		this.closeGraph();
		this.closeStory();
		this.currentInfoPanel = num;
		document.getElementById('info-panel-text-' + this.currentInfoPanel).style.color = 'white';
		//document.getElementById('info-panels').style.display = 'block';
		document.getElementById('info-panel-' + num).style.display = 'block';
		this.turnOnBlur();
		this.setAttractTimeout();
		document.getElementById('info-panel-2-scroll').scrollTop = 0;
		this.openInfoPanelPosition = this.currentPosition;

		/*
		Send analytics data.
		*/
		Analytics.push('modalOpen', num);
	}

	closeInfoPanel(){
		if(this.currentInfoPanel){
			document.getElementById('info-panel-text-' + this.currentInfoPanel).style.color = 'rgb(0, 132, 153)';
		}
		document.getElementById('info-panel-1').style.display = 'none';
		document.getElementById('info-panel-2').style.display = 'none';
		this.turnOffBlur();
		this.setAttractTimeout();

		/*
		Send analytics data.
		*/
		Analytics.push('modalClose', this.currentInfoPanel);
	}

	setAttractTimeout(){
		this.clearAttractTimeout()
		this.timeout = window.setTimeout(() => this.startAttract(), ATTRACT_TIMEOUT);
	}

	clearAttractTimeout(){
		if(this.timeout){
			window.clearTimeout(this.timeout);
		}
	}

	startAttract(){
		this.attract.start();
		this.closeGraph();
		this.closeStory();
		this.closeInfoPanel();
		this.attractOn = true;

		/*
		Send analytics data.
		*/
		Analytics.push('idle', '');
	}

	stopAttract(){
		this.attract.stop(this);
		this.attractOn = false;

		/*
		Send analytics data.
		*/
		Analytics.push('start', '');
	}

	set scrolling(bScrolling){
		this.background.scrolling = bScrolling;
	}

}

// module.exports = Ui;
