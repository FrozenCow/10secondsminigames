define(['utils','ludum-constants','physics','vector'],function(utils,constants,physics,Vector) {
	function updateBall(ball) {
		var r = {
			x: ball.x + ball.vx,
			y: ball.y + ball.vy,
			vx: ball.vx,
			vy: ball.vy,
			color: ball.color
		};
		physics.handleLineCollision(r, 20, 1, constants.outerbox, []);
		return r;
	}

	function initializeMinigame(gamestate) {
		var f = gamestate.frame;
		var players = gamestate.players;
		return {
			type: 'touchtheball',
			balls: utils.repeat(function(i) {
				var b = f+i*4;
				return {
					x: utils.random(b+0)*800,
					y: utils.random(b+1)*400,
					vx: utils.randomSpeed(b+2,5,10),
					vy: -Math.abs(utils.randomSpeed(b+3,5,10)),
					color: constants.colors[i]
				};
			},20),
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					touched: false
				};
			})
		};
	}

	function updateMinigame(gamestate,minigame) {
		return {
			type: minigame.type,
			balls: minigame.balls.map(updateBall),
			players: minigame.players.map(function(player) {
				var p = gamestate.players.filter(function(p) { return p.clientid === player.clientid; })[0];
				if (!p) { return utils.deepClone(player); }
				return {
					clientid: player.clientid,
					status: (player && player.status) || (p && (Vector.distanceBetween(minigame.balls[0].x,minigame.balls[0].y, p.x,p.y) < 40))
				};
			})
		};
	}

	function getScores(minigame) {
		return minigame.players.map(function(player) {
			return {
				clientid: player.clientid,
				score: player.status === true ? 1 : 0
			};
		}).sort(function(a,b) { return a.score-b.score; });
	}

	function getTitle(minigame) {
		return 'Touch the red ball';
	}

	function drawMinigame(minigame) {
		minigame.balls.forEach(this.drawBall.bind(this));
	}

	return {
		initialize: initializeMinigame,
		update: updateMinigame,
		getScores: getScores,
		getTitle: getTitle,
		draw: drawMinigame
	};
});