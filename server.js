var io = require('socket.io')(8090);

// winning combinations (in octal) with the board
// represented as 9 bits
var wins = [0007, 0070, 0700, 0111, 0222, 0444, 0124, 0421];

function Game () {
  this.init = function () {
    // records which squares are already taken
    this.moves = new Array(9);

    // square index (1, 2, 4, 8...) is added to the mask
    // when that square is moved to
    this.masks = {
      X: 0,
      O: 0
    };
  }

  this.init();
}

// updates the player mask and checks if it contains a winning combo
Game.prototype.move = function (square, player) {
  // return null if the square is taken
  if (this.moves[square]) return null;

  // otherwise, return true if the player won, false if not
  var mask = this.masks[player] |= 1 << square;
  this.moves[square] = true;
  return wins.some(function (win) {
    return (mask & win) === win;
  });
}

var lobby = [];
var games = {};

// TODO
setTimeout(function () {
  var p1, p2;
  while (lobby.length > 1) {
    p1 = lobby.shift();
    p2 = lobby.shift();
  }
});

io.on('connection', function (socket) {
  var player, opponent, roomId;
  if (lobby.length) {
    opponent = lobby.pop();
    roomId = opponent.roomId;
    player = 'O';
    socket.join(roomId);
    opponent.socket.join(roomId);
    games[roomId] = new Game();
    io.to(roomId).emit('startGame');
  } else {
    player = 'X';
    roomId = Math.random();
    lobby.push({
      socket: socket,
      roomId: roomId
    });
  }

  socket.emit('setPlayer', player);

  socket.on('move', function (square) {
    var result = games[roomId].move(square, player);
    if (result) {
      games[roomId].init();
    }
    io.to(roomId).emit('moveAck', result, square, player);
  });

  socket.on('disconnect', function() {
    games[roomId] = undefined;
    // TODO
    io.to(roomId).emit('boot');
  });
});
