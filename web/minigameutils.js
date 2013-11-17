define(['ludum-constants','physics','utils','vector'],function(constants,physics,utils,Vector) {
	function createBox(name,x,y) {
		var r = 20;
		return {
			name: name,
			x: x-r,
			y: y-r,
			w: r*2,
			h: r*2,
			collision: physics.createBox([
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

	function getPlayerName(clientid) {
		return constants.playernames && constants.playernames[clientid];
	}

	return {
		createBox: createBox,
		createBoxOnRow: createBoxOnRow,
		createBoxRows: createBoxRows,
		getPlayerName: getPlayerName
	};
});