// const d3 = require('d3');


// function requireText(filepath) {
//   var reader = new FileReaderSync();
//   var result_base64 = reader.readAsDataURL(file);
//   return reader.readAsText(result_base64);
// }

// Load JSON text from server hosted file and return JSON parsed object
function requireJSON(filePath) {
  // Load json file;
  var json = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}

// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType)
{
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET",filePath,false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  return xmlhttp.responseText;
}

(function() {
  window.utils = {};

	utils.currentScale = function(){
		return {
			width: window.innerWidth / 1920.0,
			height: window.innerHeight / 1080.0
		}
	}

  utils.getStyle = function(oElm, strCssRule){
		var strValue = "";
		if(document.defaultView && document.defaultView.getComputedStyle){
			strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
		}
		else if(oElm.currentStyle){
			strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
				return p1.toUpperCase();
			});
			strValue = oElm.currentStyle[strCssRule];
		}
		return strValue;
  };

	utils.addBorderSvg = function(elemId, complete=true){
		d3.select('#' + elemId + '-svg').selectAll('*').remove();
		let dElem = document.getElementById(elemId);
		let dElemWidth = dElem.offsetWidth;
		let dElemHeight = dElem.offsetHeight;
		let clipPath = utils.getStyle(dElem, "clip-path");
		let clipDims = clipPath.match(/\(([^)]+)\)/)[1].split(',');
		let dSvg = document.getElementById(elemId + '-svg');
		let pathElem = document.createElementNS('http://www.w3.org/2000/svg',"path")
		let pathStr = 'M0 0';
		clipDims.forEach(dim => {
			let dimTokens = dim.trim().split(' ');
			let dimX = dElemWidth * (parseInt(dimTokens[0]) / 100.0);
			let dimY = dElemHeight * (parseInt(dimTokens[1]) / 100.0);
			pathStr += ' L' + dimX + ' ' + dimY;
		});
		if(complete){
			pathStr += ' Z'
		}
		//console.log('Appending path ' + pathStr);
		pathElem.setAttributeNS(null, "d", pathStr);
		pathElem.setAttributeNS(null, "fill", "none");
		pathElem.setAttributeNS(null, "stroke", "rgb(0, 132, 153");
		pathElem.setAttributeNS(null, "stroke-width", "4");
		dSvg.appendChild(pathElem);
	}

	utils.truncateNumber = function(num, numDigits){
		let truncated = num.toFixed(numDigits);
		let tokens = truncated.split('.');
		if(/^(.)\1+$/.test(tokens[1]) || tokens[1] == '0'){
			return tokens[0];
		} else {
			return tokens[0] + '.' + tokens[1];
		}
	}

})();

// module.exports = {
// 	currentScale: currentScale,
// 	getStyle: getStyle,
// 	addBorderSvg: addBorderSvg,
// 	truncateNumber: truncateNumber
// }
