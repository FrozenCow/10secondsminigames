define(['ludum-minigames'],function(minigames) {
	var stateDrawers = {
		'wait': drawWaitState,
		'pregame': drawPregameState,
		'postgame': drawPostgameState,
		'minigame': drawMinigameState
	};

	function findPlayer(gamestate,clientid) {
		for(var i=0;i<gamestate.players.length;i++) {
			if (gamestate.players[i].clientid === clientid) {
				return gamestate.players[i];
			}
		}
	}

	function drawTimeLeft(time) {
		// if (time < 30*3) {
			this.fillStyle('rgba(255,255,255,0.3)');
			this.context.font = 'bold 48pt Arial';
			this.fillCenteredText(Math.floor(time / 30 + 1).toString(),400,300);
		// }
	}
	function drawWaitState(gamestate,state) {

	}
	function drawPregameState(gamestate,state) {
		this.fillStyle('black');
		this.context.font = '48pt Arial';
		this.fillCenteredText(minigames[state.minigameState.type].getTitle(state.minigameState), 400, 300);
	}
	function drawMinigameState(gamestate,state) {
		minigames[state.state.type].draw.call(this, state.state);
		this.fillStyle('black');
		this.context.font = '24pt Arial';
		this.fillCenteredText(minigames[state.state.type].getTitle(state.state), 400, 30);
		this.context.font = null;
	}
	function drawPostgameState(gamestate,state) {
		this.fillStyle('rgba(0,0,0,0.5)');

		var rowheight = 30;
		var listheight = state.scores.length*rowheight;
		var listpadding = 20;

		var listwidth = 300;
		var listx = 400-listwidth*0.5;
		var listy = 300-listheight*0.5;

		this.fillRoundRectangle(
			listx-listpadding,listy-listpadding,
			listwidth+listpadding*2,listheight+listpadding*2,
			20);

		this.context.font = '20px Arial';
		this.fillStyle('white');
		this.fillText('Scores:',listx,listy);
		var rows = state.scores.map(function(score) {
			var clientid = score.clientid;
			var player = findPlayer(gamestate,clientid);
			return {
				clientid: clientid,
				roundscore: score.score,
				player: player,
				totalscore: player && player.score || 0,
				playername: draw.playernames[clientid] || 'unknown'
			};
		}).sort(function(a,b) {
			return b.totalscore-a.totalscore;
		});

		for(var i=0;i<rows.length;i++) {
			var row = rows[i];
			var y = listy+i*rowheight+rowheight;
			this.fillText(row.playername, listx+45, y);
			this.drawCenteredImage(row.roundscore > 0 ? draw.images.check : draw.images.fault,
				listx+20, y-5);
			//this.fillText(row.roundscore.toString(), listx+listwidth-60, y);
			this.fillText(row.totalscore.toString(), listx+listwidth-30, y);
		}


		//this.fillText(JSON.stringify(state), 5, 20);
	}

	function drawBall(ball) {
		this.fillStyle(ball.color);
		this.fillCircle(ball.x, ball.y, 20);
		this.drawCenteredImage(draw.images.ball,ball.x,ball.y);
	}
	function drawBox(box,color) {
		this.fillStyle(color);
		this.fillRectangle(box.x,box.y,box.w,box.h);
		this.drawCenteredImage(draw.images.box,box.x+box.w*0.5,box.y+box.h*0.5);
	}
	function drawPlayer(player,status) {
		var color;
		this.fillStyle('black');
		this.fillCircle(player.x,player.y,20);
		this.drawCenteredImage(draw.images.ball,player.x,player.y);
		if (status === null) {
		} else if (status === true) {
			this.drawCenteredImage(draw.images.happy,player.x,player.y);
		} else if (status === false) {
			this.drawCenteredImage(draw.images.sad,player.x,player.y);
		}
	}
	function drawGamestate(gamestate) {
		if (gamestate.state.type === 'minigame') {
			drawTimeLeft.call(this, gamestate.state.time);
		}

		gamestate.players.forEach(function(player) {
			var clientid = player.clientid;
			var status = null;
			if (gamestate.state.type === 'minigame') {
				var minigamePlayer = gamestate.state.state.players.filter(function(minigamePlayer) {
					return (player.clientid === minigamePlayer.clientid);
				})[0];
				status = minigamePlayer && minigamePlayer.status;
			}
			drawPlayer.call(this, player, status);
		}.bind(this));

		stateDrawers[gamestate.state.type].call(this, gamestate, gamestate.state);
	}
	var ludumGraphics = {
		drawBall: drawBall,
		drawBox: drawBox,
		drawPlayer: drawPlayer,
		drawGamestate: drawGamestate
	};
	function draw(graphics,gamestate) {
		ludumGraphics.__proto__ = graphics;
		ludumGraphics.drawGamestate(gamestate);
	}
	return draw;
});