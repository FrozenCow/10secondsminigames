define([],function() {
	var stateDrawers = {
		'postgame': drawPostgameState,
		'minigame': drawMinigameState
	}
	var minigameDrawers = {
		'touchtheball': drawTouchtheball
	};
	function drawTouchtheball(minigame) {
		this.fillCircle(minigame.ball.x, minigame.ball.y, 20);
	}
	function drawMinigameState(state) {
		minigameDrawers[state.state.type].call(this, state.state);
		this.fillText(state.state.type, 5, 20);
	}
	function drawPostgameState(state) {
		this.fillText(JSON.stringify(state), 5, 20);
	}
	function drawPlayer(player) {
		this.fillStyle(player.onground ? 'red' : 'yellow');
		this.fillCircle(player.x,player.y,20);
	}
	function drawGamestate(gamestate) {
		gamestate.players.forEach(drawPlayer.bind(this));

		stateDrawers[gamestate.state.type].call(this, gamestate.state);


		this.fillText(gamestate.state.type, 5, 10);
	}
	function draw(graphics,state) {
		drawGamestate.call(graphics, state);
	}
	return draw;
});