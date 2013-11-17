define(['utils','ludum-constants','physics','vector','minigameutils'],function(utils,constants,physics,Vector,minigameutils) {

	function initializeMinigame(gamestate) {
		var f = gamestate.frame;
		var players = gamestate.players;
		return {
			type: 'standonbox',
			boxes: utils.shuffle(
				utils.repeat(function(i) {
					return {
						color: constants.colors[i]
					};
				},boxes.length),f),
			color: constants.colors[0],
			players: players.map(function(player) {
				return {
					clientid: player.clientid,
					status: false
				};
			})
		};
	}

	function updateMinigame(gamestate,minigame,boxcollisions) {
		return {
			type: minigame.type,
			boxes: minigame.boxes,
			color: minigame.color,
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					status: player.status || (boxcollisions[player.clientid] || []).some(function(box) {
						return minigame.boxes[box.box].color === minigame.color;
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
		return 'Stand on the red box';
	}

	function drawMinigame(minigame) {
		boxes.forEach(function(box) {
			this.drawBox.call(this, box, minigame.boxes[box.name].color);
		}.bind(this));
	}

	var boxes = minigameutils.createBoxRows([
		2, 3, 2, 3, 6
	]);
	var collisionlines = boxes.reduce(function(lines,box) {
		return lines.concat(box.collision);
	},[]);

	return {
		initialize: initializeMinigame,
		update: updateMinigame,
		getScores: getScores,
		getTitle: getTitle,
		draw: drawMinigame,

		boxes: boxes,
		collisionlines: collisionlines
	};
});