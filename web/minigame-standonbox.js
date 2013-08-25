define(['utils','ludum-constants','ludum-collision','vector'],function(utils,constants,collision,Vector) {

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
		}).sort(function(a,b) { return a.score-b.score; });
	}

	function getTitle(minigame) {
		return 'Stand on the red box';
	}

	function createBox(name,x,y) {
		var r = 20;
		return {
			name: name,
			x: x-r,
			y: y-r,
			w: r*2,
			h: r*2,
			collision: collision.createBox([
				new Vector(x-r,y-r),
				new Vector(x+r,y-r),
				new Vector(x+r,y+r),
				new Vector(x-r,y+r)
			]).map(function(line) {
				line.box = name;
				return line;
			})
		};
	}

	function createBoxOnRow(name,row,column,columns) {
		var lowest = 600-80;
		var rowheight = 80+20;
		var middle = 400;
		var columnwidth = 800 / (columns+1);
		return createBox(name,(column+1)*columnwidth,lowest-rowheight*row);
	}

	function createBoxRows(rows) {
		var name = 0;
		return rows.reduce(function(boxes,columns,row) {
			return boxes.concat(
				utils.repeat(function(column) {
					return createBoxOnRow(name++,row,column,columns);
				},columns)
			);
		}, []);
	}

	function createBoxes() {
		return createBoxRows([
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