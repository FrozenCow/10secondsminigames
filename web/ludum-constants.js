define(['vector','physics'],function(Vector,physics) {

	var colors = [
		'#ff0000',
		'#00ff00',
		'#0000ff',
		'#ffff00',
		'#ff00ff',
		'#00ffff',
		'#008000',
		'#800080',
		'#008080',
		'#808080',
		'#000080',
		'#ff8000',
		'#ff0080',
		'#80ff00',
		'#00ff80',
		'#8000ff',
		'#0080ff',
		'#505000',
		'#7f7f00',
		'#c0c0c0',
		'#ff63ff',
		'#ffe4b5'
	];

	colors['red'] = '#ff0000';
	colors['green'] = '#00ff00';
	colors['blue'] = '#0000ff';
	colors['yellow'] = '#ffff00';
	colors['purple'] = '#ff00ff';
	colors['cyan'] = '#00ffff';
	colors.names = ['red','green','blue','yellow','purple','cyan'];
	colors.names.forEach(function(name) {
		colors.names[colors[name]] = name;
	});

	return {
		outerbox: physics.createBox([
			new Vector(0,0),
			new Vector(0,600),
			new Vector(800,600),
			new Vector(800,0)
		]),

		colors: colors
	};
});