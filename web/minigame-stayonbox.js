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

	function updateMinigame(gamestate,minigame,playercollisions) {
		return {
			type: minigame.type,
			boxes: minigame.boxes,
			color: minigame.color,
			players: minigame.players.map(function(player) {
				return {
					clientid: player.clientid,
					status: player.status || (playercollisions[player.clientid] || []).some(function(box) {
						return minigame.boxes[box.box].color === minigame.color;
					}) || null
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
		}).sort(function(a,b) { return b.score-a.score; });
	}

	function getTitle(minigame) {
		return 'Stay on the red box';
	}

	function createBoxes() {
		return minigameutils.createBoxRows([
			2, 3, 2, 3, 6
		]);
	}

	function getCollisionLines(boxes) {
		return boxes.reduce(function(lines,box) {
			return lines.concat(box.collision);
		},[]);
	}

	function drawMinigame(minigame) {
		boxes.forEach(function(box) {
			this.drawBox.call(this, box, minigame.boxes[box.name].color);
		}.bind(this));
	}

	var boxes = createBoxes();
	var collisionlines = getCollisionLines(boxes);

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