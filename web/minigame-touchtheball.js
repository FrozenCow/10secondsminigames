define(['vector'],function(Vector) {
	function updateBall(ball) {
		return {
			x: ball.x + ball.vx,
			y: ball.y + ball.vy,
			vx: ball.vx,
			vy: ball.vy
		};
	}

	function initializeMinigame(players) {
		return {
			type: 'touchtheball',
			ball: { x: 0, y: 0, vx: 10, vy: 8 },
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					touched: false
				}
			})
		};
	}

	function updateMinigame(players,minigame) {
		return {
			type: 'touchtheball',
			ball: updateBall(minigame.ball),
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					touched: player.touched || (Vector.distanceBetween(minigame.ball.x,minigame.ball.y, player.x,player.y) < 40)
				};
			})
		};
	}

	function getScores(minigame) {
		return minigame.players.map(function(player) {
			return { clientid: player.clientid, score: player.touched ? 1 : 0 };
		});
	}

	return {
		initialize: initializeMinigame,
		update: updateMinigame,
		getScores: getScores
	};
});