var io = require('socket.io')(8010);

// winning combinations (in octal) with the board
// represented as 9 bits
var wins = [0007, 0070, 0700, 0111, 0222, 0444, 0124, 0421];

function Game (p1, p2) {
  this.init = function () {
    // records which squares are already taken
    this.moves = new Array(9);

    // square index (1, 2, 4, 8...) is added to the mask
    // when that square is moved to
    this.masks = {
      X: 0,
      O: 0
    };

    this.players = [p1, p2];
  };

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
};

var lobby = [];
var games = {};

function createMatch (p1, p2) {
  var roomId = Math.random();
  games[roomId] = new Game(p1, p2);
  p1.join(roomId);
  p2.join(roomId);
  p1.ticTacRoomId = p2.ticTacRoomId = roomId;
  p1.emit('setPlayer', 'X');
  p2.emit('setPlayer', 'O');
  io.to(roomId).emit('startGame');
}

setTimeout(function () {
  var p1, p2;
  while (lobby.length > 1) {
    p1 = lobby.pop();
    p2 = lobby.pop();
    createMatch(p1, p2);
  }
}, 6000);

io.on('connection', function (socket) {
  if (lobby.length) createMatch(lobby.pop(), socket);
  else lobby.unshift(socket);

  socket.on('move', function (square, player) {
    var game, result, roomId = this.ticTacRoomId;
    if (roomId) {
      game = games[roomId];
      result = game.move(square, player);
      if (result) {
        game.init();
      }
      io.to(roomId).emit('moveAck', result, square, player);
    }
  });

  socket.on('disconnect', function () {
    var otherPlayer, roomId = this.ticTacRoomId;
    if (roomId) {
      otherPlayer = games[roomId].players.filter(
        (function (player) {
          return player.id !== this.id;
        }).bind(this)
      );

      otherPlayer = otherPlayer[0];

      // remove all references of the room
      delete otherPlayer.ticTacRoomId;
      otherPlayer.leave(roomId);
      delete games[roomId];

      // add the other player back into the lobby
      otherPlayer.emit('boot');
      if (lobby.length) createMatch(lobby.pop(), otherPlayer);
      else lobby.unshift(otherPlayer);
    } else {
      // remove the socket from lobby
      // ...lol efficiency wat?
      for (var i = lobby.length; i--;) {
        if (lobby[i].id === this.id) {
          lobby.splice(i, 1);
          break;
        }
      }
    }
  });
});
