define(['vector','staticcollidable'],function(Vector,StaticCollidable){
	return function(game) {
		var g = game;
		var tools = {
			'0': { // Draw
				mousemove: function(x,y) {
					if (g.mouse.buttons[0]) {
						polygon[polygon.length-1].set(x,y);
					}
				},
				mousedown: function(button,x,y) {
					if (button === 0) {
						polygon.push(new Vector(x,y));
					}
				},
				keydown: function(key) {
					if (key === 'enter') {
						g.objects.add(new StaticCollidable(polygon));
						g.objects.handlePending();
						polygon=[];
						g.emit('levelchanged');
					}
				},
				draw: function(g) {
					g.strokeStyle('black');
					g.strokePolygon(polygon);
				}
			},
			'1': {
				mousedown: function(button,x,y) {
					var me = this;
					game.objects.lists.collidable.each(function(cls) {
						for(var i=0;i<cls.collisionlines.length;i++) {
							if (cls.collisionlines[i].end.distanceTo(x,y) < 10) {
								me.grabbed = cls.collisionlines[i];
							}
						}
					});
				},
				mousemove: function(x,y) {
					var me = this;
					if (me.grabbed) {
						me.grabbed.end.set(x,y);
						me.grabbed.next.start.set(x,y);
						me.grabbed.recalculate();
						me.grabbed.next.recalculate();
						game.emit('levelchanged');
					}
				},
				mouseup: function(button,x,y) {
					var me = this;
					me.grabbed = null;
				},
				draw: function(g) {
					game.objects.lists.collidable.each(function(cls) {
						cls.collisionlines.forEach(function(cl) {
							g.fillCircle(cl.start.x,cl.start.y,10);
						});
					});
					
				}
			}
		};
		var tool = tools[0];
		var polygon = [];
		function pass(name) {
			g.on(name, function() {
				if (tool[name]) {
					tool[name].apply(tool, arguments);
				}
			});
		}
		pass('mousemove');
		pass('mousedown');
		pass('mouseup');
		pass('keydown');
		pass('keyup');
		//pass('predraw');
		//pass('postdraw');

		g.chains.draw.push(function(g,next) {
			g.fillCenteredText('EDITOR',400,300);
			if (tool.draw) { tool.draw(g); }
			next(g);
		});


		g.on('keydown', function(button) {
			if (tools[button]) {
				tool = tools[button];
			}
		});
	};
});