// const path = require('path');
// const screen = require('electron').screen;
// const {ipcRenderer} = require('electron');

class Background {

	constructor(){
		this.bScrolling = false;
		this.iceCore = new Image;
		this.iceCoreImages = [];
		this._loadImages();
		this.iceCore.src = 'img/ice_core.png';
		this.iceCoreBlur = new Image;
		this.iceCoreBlur.src = 'img/ice_core_blur.png';
		this.buttons = new Image;
		this.buttons.src = 'img/buttons.png';
		this.imageY = 0.1;
		this.currentImage = this.iceCore;
		this.depth = 0;
		// ipcRenderer.on('data', (e, data) => {
		// 	if(data.name == 'timescale'){
		// 		this.depth = data.data.depth;
		// 		this.setImage();
		// 	}
		// });
		var _this = this;
		$(document).on('data', function(e, data) {
			// console.log('Listened to data in Background', data);
			if(data.name == 'timescale'){
				_this.depth = data.data.depth;
				_this.setImage();
			}
    });
	}

	_loadImages(){
		this.iceCoreImages[0] = ({'depth': 0,
								  'minDepth': 0,
								  'maxDepth': 99,
								  'label': 'These layers, dated 1943–1945, occur at 22 m (72 ft) depth. This image represents the youngest sections of GISP2.',
								  'image': new Image});
		this.iceCoreImages[0].image.src = 'img/GISP2D-022-1.png';
		this.iceCoreImages[1] = ({'depth': 100,
								  'minDepth': 100,
								  'maxDepth': 999,
								  'label': 'Seen here are loosely packed grains of ice from over 1,200 years ago, found at 324 m (1,062 ft) depth.',
								  'image': new Image});
		this.iceCoreImages[1].image.src = 'img/GISP2D-364_001.png';
		this.iceCoreImages[2] = ({'depth': 1000,
								  'minDepth': 1000,
								  'maxDepth': 1649,
								  'label': 'This roughly 5,000-year-old section from 1,400 m (4,593 ft) depth represents the transition from grainy younger layers to solid ice.',
								  'image': new Image});
		this.iceCoreImages[2].image.src = 'img/GISP2D-1400.png';
		this.iceCoreImages[3] = ({'depth': 1650,
								  'minDepth': 1650,
								  'maxDepth': 2199,
								  'label': 'This segment shows seasonal layers at 1,841 m (1.1 mi) depth, which were laid down about 16,350 years ago.',
								  'image': new Image});
		this.iceCoreImages[3].image.src = 'img/GISP2D-1841x203-4.321.png';
		this.iceCoreImages[4] = ({'depth': 2200,
								  'minDepth': 2200,
								  'maxDepth': 2799,
								  'label': 'The deepest ice layers that can be dated are 110,000 years old. These begin at about 2,808 m (1.7 mi) depth.',
								  'image': new Image});
		this.iceCoreImages[4].image.src = 'img/GISP2D-2690-1.png';
		this.iceCoreImages[5] = ({'depth': 2800,
								  'minDepth': 2800,
								  'maxDepth': 3200,
								  'label': 'This scan represents the lowest 30 m (98 ft) or so of the GISP2 ice core; layers here are of unknown age.',
								  'image': new Image});
		this.iceCoreImages[5].image.src = 'img/GISP2D-3048.png';
	}

	setImage(){
		for(let i = 0; i < this.iceCoreImages.length; i++){
			if(this.depth >= this.iceCoreImages[i].minDepth && this.depth <= this.iceCoreImages[i].maxDepth){
				document.getElementById('ice-core-img').src = this.iceCoreImages[i].image.src;
				let imgLabel = document.getElementById('ice-core-img-label')
				if(imgLabel){
					imgLabel.innerHTML = '*' + this.iceCoreImages[i].label;
				}
			}
		}
	}

	set scrolling(bScrolling) {
		this.bScrolling = bScrolling;
		if(this.bScrolling){
			//this.currentImage = this.iceCoreBlur;
		} else {
			this.setImage();
		}
	}

	draw(p){
		let blurAmount = 1000.0 * (p.velocity);
		let blurFilter = document.getElementById('blur').children[0];
		if (!isNaN(blurAmount)) blurFilter.setAttribute('stdDeviation', blurAmount + ',0');
	}
}

// module.exports = Background;
