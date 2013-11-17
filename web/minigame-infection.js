define(['utils','ludum-constants','physics','vector','minigameutils'],function(utils,constants,physics,Vector,minigameutils) {
	function initializeMinigame(gamestate) {
		var f = gamestate.frame;
		var players = gamestate.players;
		var infectedclientid = gamestate.players.reduce(function(highest,player) {
			return (!highest || player.score > highest.score) ? player : highest;
		}).clientid;
		return {
			type: 'infection',
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					status: infectedclientid !== player.clientid
				};
			})
		};
	}

	function updateMinigame(gamestate,minigame,boxcollisions,playercollisions) {
		var playerLookup = utils.createLookup(minigame.players,function(player) { return player.clientid; });
		return {
			type: minigame.type,
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					status: player.status && !(playercollisions[player.clientid] || []).some(function(clientid) {
						return !playerLookup[clientid].status;
					})
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
		return 'Don\'t get infected!';
	}

	function drawMinigame(minigame) {
		boxes.forEach(function(box) {
			this.drawBox.call(this, box, 'black');
		}.bind(this));
	}

	var boxes = minigameutils.createBoxRows([
		2, 3, 2, 3, 6
	]);
	var collisionlines = boxes.reduce(function(lines,box) {
		return lines.concat(box.collision);
	},[]);

	return {
		isAvailable: function(game) {
			return game.players.length > 1;
		},
		initialize: initializeMinigame,
		update: updateMinigame,
		getScores: getScores,
		getTitle: getTitle,
		draw: drawMinigame,

		boxes: boxes,
		collisionlines: collisionlines
	};
});