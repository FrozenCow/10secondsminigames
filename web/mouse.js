define(function() {
	return function(g) {
		g.mouse = {
			over: false,
			x: 0,
			y: 0,
			buttons: {}
		};
		g.canvas.addEventListener('mouseup', function(event) {
			if (g.mouse.buttons[event.button]) {
				g.mouse.x = event.offsetX||event.clientX;
				g.mouse.y = event.offsetY||event.clientY;

				delete g.mouse.buttons[event.button];
				g.emit('mouseup', event.button, g.mouse.x, g.mouse.y);
			}
			return false;
		},true);
		g.canvas.addEventListener('mousedown', function(event) {
			if (!g.mouse.buttons[event.button]) {
				g.mouse.x = event.offsetX||event.clientX;
				g.mouse.y = event.offsetY||event.clientY;
				g.mouse.buttons[event.button] = true;
				g.emit('mousedown', event.button, g.mouse.x, g.mouse.y);
			}
			return false;
		},true);
		g.canvas.addEventListener('mousemove', function(event) {
			g.mouse.x = event.offsetX||event.clientX;
			g.mouse.y = event.offsetY||event.clientY;
			g.emit('mousemove', g.mouse.x, g.mouse.y);
		},true);
	};
});