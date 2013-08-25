# 10secondsminigames

A multiplayer game in pure Javascript and Node for Ludum Dare 27.

This project makes use of websockets and I've tried to implement the game logic in a pure
functional manner, so that the multiplayer mechanics will work using simulator.js. The code
is far from efficient, but it works (and kept working while making changes) without desyncing
and with minimal network traffic.

[Play the game](http://softwarebakery.com:8000/)
[Ludum Dare entry](http://www.ludumdare.com/compo/ludum-dare-27/?action=preview&uid=8435)

## Installation

    $ npm install

## Running

    $ node index.js
    
Open up a browser and navigate to http://localhost:8085/.

