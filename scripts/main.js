;(function ( exports ) {
  var Game = function( width, height, id ) {
    this.winningCombinations = [ [0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 0, 3, 6 ], [ 1, 4, 7 ], [ 2, 5, 8 ], [ 0, 4, 8 ], [ 2, 4, 6 ] ];
    this.startTime = new Date;
    this.player = 1;

    this.width = width;
    this.height = height;
    this.id = id;

    this.score1 = 0;
    this.score2 = 0;
    this.scoreContainer = document.getElementById( 'scores' );
    this.scoreCounters = this.scoreContainer.childNodes;
    this.scoreCounter1 = this.scoreCounters[0];
    this.scoreCounter2 = this.scoreCounters[1];
    this.turn = 0;
    this.moves = [];

    this.canvas = initCanvas( this, this.width, this.height, this.id, true );
    document.body.insertBefore( this.canvas.element, this.scoreContainer );

    this.playerRadius = 40;
    this.canvas.context.lineWidth = 8;
    this.canvas.context.strokeStyle = '#2c3e50';

    this.canvas.paintBoard();
  };

  var initCanvas = function ( game, width, height, id, relativeMouse ) {
    var
    createHDCanvas,
    clearCanvas,
    draw,
    paintBoard,
    paintMessage,
    clickHandler,
    element,
    context;

    if ( relativeMouse || relativeMouse === undefined ) {
      HTMLCanvasElement.prototype.relativeMouseCoords = function ( event ) {
        var
        totalOffsetX = 0,
        totalOffsetY = 0,
        canvasX = 0,
        canvasY = 0,
        currentElement = this;

        do {
          totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
          totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
          currentElement = currentElement.offsetParent;
        } while ( currentElement );

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        return {
          x: canvasX,
          y: canvasY
        };
      };
    }

    // Creates a scaled-up canvas based on the device's
    // resolution, then displays it properly using styles
    createHDCanvas = function ( ratio ) {
      var
      canvas = document.createElement( 'canvas' ),
      pixelRatio;

      // Creates a dummy canvas to test device's pixel ratio
      pixelRatio = function () {
        var
        context = document.createElement( 'canvas' ).getContext( '2d' ),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio || 1;
        return dpr / bsr;
      };

      if ( !ratio ) {
        ratio = pixelRatio();
      }

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.getContext( '2d' ).setTransform( ratio, 0, 0, ratio, 0, 0 );
      canvas.id = id;

      return canvas;
    };

    clearCanvas = function () {
      context.clearRect(0, 0, width, height);
    };

    draw = function ( player, x, y ) {
      if ( player ) { // X
        context.moveTo(x - game.playerRadius, y - game.playerRadius);
        context.lineTo(x + game.playerRadius, y + game.playerRadius);
        context.moveTo(x - game.playerRadius, y + game.playerRadius);
        context.lineTo(x + game.playerRadius, y - game.playerRadius);
      } else { // O
        context.beginPath();
        context.arc( x, y, game.playerRadius, 0, 2 * Math.PI );
      }
      context.stroke();
    };

    paintBoard = function () {
      clearCanvas();
      context.beginPath();

      for ( var i = 3; i >= 0; i-- ) {
        context.moveTo( ( width / 3 ) * i, 0 );
        context.lineTo( ( width / 3 ) * i, height );

        context.moveTo( 0, ( height / 3 ) * i );
        context.lineTo( width, ( height / 3 ) * i );
      }

      context.stroke();
      context.closePath();
    };

    paintMessage = function ( message ) {
      clearCanvas();
      context.fillStyle = '#2c3e50';
      context.fillRect( 0, 0, width, height );
      context.fillStyle = '#9b59b6';
      context.font = "18px sans-serif";
      context.fillText( message, 5, 20 );
    };

    element = createHDCanvas();
    context = element.getContext( '2d' );

    return {
      element: element,
      context: context,
      clearCanvas: clearCanvas,
      clickHandler: clickHandler,
      draw: draw,
      paintBoard: paintBoard,
      paintMessage: paintMessage
    };
  };

  var clickHandler = function ( event, game ) {
    var
    coords = game.canvas.element.relativeMouseCoords( event ),
    x = Math.floor( coords.x * 3 / game.width ),
    y = Math.floor( coords.y * 3 / game.height ),
    index = x + y * 3,
    clickTime = new Date;

    if ( typeof( game.moves[ index ] ) === 'undefined' ) {
      var
      xPixels = game.width * ( 2 * x + 1 ) / 6;
      yPixels = game.height * ( 2 * y + 1 ) / 6;

      game.moves[ index ] = game.player;
      game.canvas.draw( game.player, xPixels, yPixels );
      game.canvas.context.stroke();

      console.log('Received move "' + game.player + '" at time ' + ( clickTime - game.startTime ) );

      if ( ++game.turn === 9 ) {
        game.turn = 0;
        game.moves = [];

        game.canvas.paintBoard();
      }

    }
  };

  document.addEventListener( 'DOMContentLoaded', function () {
    var game = new Game( 400, 400, 'tictactoe' );
    game.canvas.element.addEventListener( 'click', function ( event ) {
      clickHandler( event, game );
    }, false);
  }, false );

})( this );
