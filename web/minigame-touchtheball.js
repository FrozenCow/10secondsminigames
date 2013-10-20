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
		var colors = constants.colors.slice(0);
		var colorNames = constants.colors.names.slice(0);
		function randomColor(seed) {
			var colorIndex;
			if (colorNames.length > 0) {
				var colorNameIndex = utils.randomInt(seed,colorNames.length);
				var colorName = colorNames.splice(colorNameIndex,1)[0];
				var color = constants.colors[colorName];
				colorIndex = colors.indexOf(color);
				colors.splice(colorIndex,1);
				return color;
			}
			if (colors.length === 0) {
				colors = constants.colors.slice(0).filter(function(color) {
					return !constants.colors.names[color];
				});
			}
			colorIndex = utils.randomInt(seed,colors.length);
			return colors.splice(colorIndex,1)[0];
		}
		var ballCount = 20+utils.randomInt(f,20);
		return {
			type: 'touchtheball',
			balls: utils.repeat(function(i) {
				var seed = f+i*5;
				return {
					x: utils.random(seed+0)*800,
					y: utils.random(seed+1)*400,
					vx: utils.randomSpeed(seed+2,5,10),
					vy: -Math.abs(utils.randomSpeed(seed+3,5,10)),
					color: randomColor(seed)
				};
			},ballCount),
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
		return 'Touch the '+constants.colors.names[minigame.balls[0].color]+' ball';
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