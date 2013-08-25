define(function() {
	var keyNames = {
		'27': 'escape',
		'32': 'space',
		'38': 'up',
		'40': 'down',
		'39': 'right',
		'37': 'left',
		'13': 'enter',
		'16': 'shift'
	};
	var i;
	// Alphabetic characters
	for(i=0;i<27;i++) {
		keyNames[i+65] = String.fromCharCode(i+97);
	}
	// Numeric characters
	for(i=0;i<10;i++) {
		keyNames[i+48] = String.fromCharCode(i+48);
	}
	return function(g) {
		g.keys = {};
		g.canvas.addEventListener('keyup', function(event) {
			var keyName = keyNames[event.keyCode];
			if (keyName) {
				if (g.keys[keyName]) {
					delete g.keys[keyName];
					g.emit('keyup', keyName);
				}
				event.preventDefault();
			}
		},true);
		g.canvas.addEventListener('keydown', function(event) {
			var keyName = keyNames[event.keyCode];
			if (keyName) {
				if (!g.keys[keyName]) {
					g.keys[keyName] = true;
					g.emit('keydown', keyName);
				}
				event.preventDefault();
			}
		},true);
	};
});