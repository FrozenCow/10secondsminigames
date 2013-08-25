define(['vector','ludum-collision'],function(Vector,collision) {
	return {
		outerbox: collision.createBox([
			new Vector(0,0),
			new Vector(0,600),
			new Vector(800,600),
			new Vector(800,0)
		]),
		colors: [
			'#ff0000',
			'#0000ff',
			'#00ff00',
			'#ff00ff',
			'#ffff00',
			'#00ffff',
			'#008000',
			'#800080',
			'#800080',
			'#008080',
			'#808080',
			'#000080',
			'#800000',
			'#7f7f00',
			'#c0c0c0',
			'#ff6347',
			'#ffe4b5'
		]
	};
});