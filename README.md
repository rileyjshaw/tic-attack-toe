# Tic Attack Toe
**Rapidfire, turnless tic-tac-toe**

Tic Attack Toe is Xs and Os meets [Kung-Fu Chess](http://en.wikipedia.org/wiki/Kung-Fu_Chess).

## Client
Run `npm install` and `bower install`, then build and watch with `gulp`.

## Server
Feel free to use my lobby server.

If you want to use your own, run `npm install` then `nodemon server.js`.

You'll need to change the line in `scripts/main.js` that says,
```javascript
var socket = io('http://toyserver.rileyjshaw.com:8010');
```

## Disclaimer
I wrote this while half-asleep on a plane. It's really messy. By viewing the source you agree **not** to:

 1. Take it as <del>best</del>good-practice in *any* way, or
 2. judge me.

## License
MIT, have at 'er.
