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

var rooms = [{
  users: 0
}];

io.on('connection', function (socket) {
  var room = rooms.length - 1;
  var roomLength = rooms[room].users;
  var player;

  // create a new room if the last one is full
  if (roomLength === 2) {
    room = rooms.push({
      users: 0
    }) - 1;
  }

  rooms[room].users++;
  socket.join(room);

  // if they're the second person to join the room
  if (roomLength === 1) {
    player = 'O';
    socket.emit('setPlayer', player);
    rooms[room].game = new Game();
    io.to(room).emit('startGame');
  } else {
    player = 'X';
    socket.emit('setPlayer', player);
  }

  socket.on('move', function (square) {
    var result = rooms[room].game.move(square, player);
    if (result) {
      rooms[room].game.init();
    }
    io.to(room).emit('moveAck', result, square, player);
  });

  socket.on('disconnect', function() {
    io.to(room).emit('boot');
/*
    var i = allClients.indexOf(socket);
    delete allClients[i];
*/  });
});
