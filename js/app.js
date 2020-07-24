function addCommas(n){
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var app = (function() {

  // const {ipcRenderer} = require('electron');
  // const path = require('path')
  // const Ui = require(path.resolve('app/js/ui/ui'));
  // const Story = require(path.resolve('app/js/ui/components/story'));

  var ui = new Ui();
  var bScrolling = false;
  var scrollingTimeout = null;
  var scrollingPosition = 0.0;
  //var iceExtent = new Story({'startScaled': 0.0, 'endScaled':1.0, 'directory': 'sea_ice', 'imgId':'ice-extent-img'});
 //iceExtent.compose(0.0);

  function scrollingStopped(){
    bScrolling = false;
    ui.scrolling = bScrolling;
    ui.draw(scrollingPosition);
  }

  function keyPressed(key){
    console.log('keydown', key);
    $(document).trigger('keydown', [key]);
    // ipcRenderer.send('keydown', key);
  }

  function mouseScrolled(deltaY){
    if(deltaY > 0){
      positionTracker.increment();
    } else {
      positionTracker.decrement();
    }
  }

  // window.addEventListener('keydown', event => keyPressed(event.key));
  window.addEventListener('mousewheel', event => mouseScrolled(event.deltaY));

  function positionChanged(e, data){
    //console.log(`iwall:position: ${data.position.position}`);
    scrollingPosition = data.position;
    ui.draw(scrollingPosition);
    if(!bScrolling){
      bScrolling = true;
      ui.scrolling = bScrolling;
    }
    if(scrollingTimeout !== null){
      clearTimeout(scrollingTimeout);
    }
    scrollingTimeout = setTimeout(scrollingStopped, 500);
  }

  function dataReceived(e, data){
    // console.log('Received data', data);
    if(data.name === 'timescale'){
      setDepth(data.data.depth);
      setTimescale(data.data.iceAge);
      ui.updateDashboard(data.data.iceAge);
    }
  }

  function setDepth(d){
    //console.log(`Depth = ${d} meters.`);
    let ft = d * 3.2808;
    document.getElementById('dyn-depth').innerHTML = addCommas(d.toFixed(1));
    document.getElementById('depth-ft').innerHTML = addCommas(ft.toFixed(1));
  }

  function setTimescale(t){
    //console.log(`Time = ${t} years ago.`);
    let displayCE = false;
    let n = t;
    if(t < 2019 && t > 0){
      n = 2018 - (Math.floor(t / 1) * 1);
      if(n > 1988){
        n = 1988;
      }
      displayCE = true;
    }
    if(t < 9999 && t > 2019){
      n = Math.floor(t / 10) * 10;
    }
    if(t < 99999 && t > 9999){
      n = Math.floor(t / 100) * 100;
    }
    if(t > 109999){
      document.getElementById('dyn-time').innerHTML = '> 110,000'
      return;
    }
    if(n === 0){
      n = 1988;
      displayCE = true;
    }
    if(displayCE){
      document.getElementById('dyn-time').innerHTML = n;
    } else {
      document.getElementById('dyn-time').innerHTML = addCommas(n);
    }
    if(displayCE){
      document.getElementById('date-years').innerHTML = 'AD';
      document.getElementById('date-ago').innerHTML = '';
    } else {
      document.getElementById('date-years').innerHTML = 'years';
      document.getElementById('date-ago').innerHTML = '&nbsp ago';
    }
  }

  function displayStory(){
    var imgPath = path.resolve('app/img/content_ice_core.jpg');
    document.getElementById('story-ic-img').src = imgPath;
    document.getElementById('story-title').innerHTML =
      'Ice Core ipsum dolor';
    document.getElementById('story-body').innerHTML =
      '1200 meters below the surface, 15,000 years ago... Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.';
  }

  function init(){

    // disable imagedrag, selection, rightclick, mouse cursor
    document.ondragstart = function() { return false; };
    document.onselectstart = function() { return false; };
    // document.oncontextmenu = function() { return false; };
    //document.onmousewheel = function(e) { e.preventDefault(); e.stopImmediatePropagation(); return false; };
    // document.body.style.cursor = 'none';
    // document.addEventListener('keydown',(event)=>{
    //   const keyName = event.key;
    //   switch (keyName){
    //     // press m to show mouse cursor
    //     case 'm': document.body.style.cursor = document.body.style.cursor==='none' ? 'initial' : 'none';
    //   }
    // });

    // iwall events
    //ipcRenderer.on('data', dataReceived);
    $(document).on('data', function(e, value) {
      dataReceived(e, value);
    });

    $(document).on('position-change', function(e, p) {
      // console.log('position-change', p)
      positionChanged(e, p)
    });

    //displayStory();
    ui.init();
    ui.draw(0.0);
    // ipcRenderer.on('iwall:position', positionChanged);
  }

  return {
    init: init
  };

})();

window.addEventListener( 'load', app.init );
