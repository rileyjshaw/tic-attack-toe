var Howl = require('howler').Howl;
var isMobile = require('ismobilejs').any;

// Creates an HD canvas element on page and returns
// a reference to the element
function createCanvasElement (width, height, id, insertBefore) {
  // Creates a scaled-up canvas based on the device's
  // resolution, then displays it properly using styles
  function createHDCanvas (ratio) {
    var canvas = document.createElement('canvas');

    if (typeof ratio !== 'number') {
      // Creates a dummy canvas to test device's pixel ratio
      ratio = (function () {
        var ctx = document.createElement('canvas').getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
      })();
    }

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    canvas.id = id;

    return canvas;
  }

  var canvas = createHDCanvas();
  document.body.insertBefore(canvas, insertBefore);
  return canvas;
}

// Returns mouse coordinates that are
// relative to the canvas, i.e. useful
function relativeCoords (event) {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var currentElement = game;

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  } while (currentElement);

  var canvasX = event.pageX - totalOffsetX;
  var canvasY = event.pageY - totalOffsetY;

  return {
    x: canvasX,
    y: canvasY
  };
}

function drawMessage (message) {
    if (typeof message === 'string') {
      if (messageContainer.className) messageContainer.className = '';
      messageContainer.textContent = message;
    } else {
      ctx.clearRect(0, 0, width, height);
      messageContainer.className = 'noMessage';
    }
}

function drawPlayer (i, player) {
  var x = width * (2 * (i % 3) + 1) / 6;
  var y = height * (2 * (Math.floor(i / 3)) + 1) / 6;

  ctx.beginPath();

  if (player === 'X') {
    ctx.moveTo(x - playerRadius, y - playerRadius);
    ctx.lineTo(x + playerRadius, y + playerRadius);
    ctx.moveTo(x - playerRadius, y + playerRadius);
    ctx.lineTo(x + playerRadius, y - playerRadius);
  } else if (player === 'O') {
    ctx.beginPath();
    ctx.arc(x, y, playerRadius, 0, 2 * Math.PI);
  } else throw 'Invalid player argument ' + player;

  ctx.stroke();
  ctx.closePath();
}

function handleClick (event) {
  var coords = relativeCoords(event);
  var x = Math.floor(coords.x * 3 / width);
  var y = Math.floor(coords.y * 3 / height);
  var i = x + y * 3;
  var clickTime = new Date().getTime();
  socket.emit('move', i, player);
}

function countdown (first, n) {
  n = n || 3;
  (function step () {
    if (n) {
      drawMessage((first ? 'Starting ' : 'Re') + 'match in ' + n--);
      nextStep = setTimeout(step, 300);
    } else drawMessage();
  })();
}

var width = 400;
var height = 400;

var scoreContainer = document.getElementById('scores');
var scoreX = document.getElementById('score1');
var scoreO = document.getElementById('score2');
var messageContainer = document.getElementById('messageContainer');
var game = createCanvasElement(width, height, 'game', scoreContainer);
var bg = createCanvasElement(width, height, 'bg', game);
var ctx = game.getContext('2d');
var bgCtx = bg.getContext('2d');

var playerRadius = 40;
ctx.lineWidth = bgCtx.lineWidth = 8;
ctx.strokeStyle = bgCtx.strokeStyle = '#4f997d';

var winSound = new Howl({
  urls: ['win.mp3', 'win.ogg', 'win.wav']
});

var loseSound = new Howl({
  urls: ['lose.mp3', 'lose.ogg', 'lose.wav']
});

var socket = io('http://toyserver.rileyjshaw.com:8010');
var player;
var nextStep;
var scores = {
  X: 0,
  O: 0
};

socket.on('startGame', function () {
  countdown(true);
});

socket.on('setPlayer', function (character) {
  player = character;
});

socket.on('moveAck', function (result, square, mover) {
  if (result !== null) {
    drawPlayer(square, mover);
    if (result) {
      drawMessage('Team ' + mover + ' won!');
      (mover === 'X' ? scoreX : scoreO).innerText = ++scores[mover];
      (mover === player ? winSound : loseSound).play();
      nextStep = setTimeout(countdown, 1000);
    }
  }
});

socket.on('boot', function () {
  clearTimeout(nextStep);
  drawMessage('Waiting for opponent');
});

bgCtx.beginPath();

for (var i = 3; i >= 0; i--) {
  bgCtx.moveTo((width / 3) * i, 0);
  bgCtx.lineTo((width / 3 ) * i, height);

  bgCtx.moveTo(0, (height / 3) * i);
  bgCtx.lineTo(width, (height / 3) * i);
}

bgCtx.stroke();
bgCtx.closePath();

game.addEventListener(isMobile ? 'touchstart' : 'mousedown', function (event) {
  handleClick(event);
}, false);
