define(['utils','ludum-constants','physics','vector','minigameutils'],function(utils,constants,physics,Vector,minigameutils) {
	function initializeMinigame(gamestate) {
		var f = gamestate.frame;
		var players = gamestate.players;
		var tagclientid = gamestate.players.reduce(function(highest,player) {
			return (!highest || player.score < highest.score) ? player : highest;
		}).clientid;
		return {
			type: 'tag',
			tagclientid: tagclientid,
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					status: tagclientid !== player.clientid
				};
			})
		};
	}

	function updateMinigame(gamestate,minigame,boxcollisions,playercollisions) {
		return {
			type: minigame.type,
			tagclientid: minigame.tagclientid,
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					status: player.status && !(playercollisions[player.clientid] || []).some(function(clientid) {
						return clientid === minigame.tagclientid;
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
		if (constants.playernames && constants.playernames[minigame.tagclientid] !== undefined) {
			return 'Tag! ' + constants.playernames[minigame.tagclientid] + ' is it!';
		} else {
			return 'Give a hug (I guess this is a bug?)';
		}
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