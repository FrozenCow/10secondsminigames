define(['eventemitter','objectmanager','graphics'], function(eventemitter,ObjectManager,Graphics) {
	function chain(fs,next) {
		function call(i,args) {
			if (i < fs.length) {
				var f = fs[i];
				var fargs = [function(){return call(i+1,arguments);}];
				Array.prototype.unshift.apply(fargs,args);
				return f.apply(null,fargs);
			} else {
				return next.apply(null,args);
			}
		}
		return function(/*...*/) {
			call(0,arguments);
		};
	}

	function Game(start, canvas, components) {
		var me = this;
		this.objects = new ObjectManager();
		this.objects.lists.update = this.objects.createIndexList('updatable');
		this.objects.lists.draw = this.objects.createIndexList('drawable');
		this.chains = {
			draw: [],
			update: []
		};

		this.chains.draw.push(this.chains.draw.objects = function(g,next) {
			me.objects.lists.draw.each(function(o) {
				o.draw(g);
			});
			next(g);
		});

		this.chains.update.push(this.chains.update.objects = function(dt,next) {
			me.objects.lists.update.each(function(o) {
				o.update(dt);
			});
			me.objects.handlePending();
			next(dt);
		});

		this.width = canvas.width;
		this.height = canvas.height;
		this.canvas = canvas;
		this.graphics = new Graphics(canvas.getContext('2d'));
		this.time = 0;

		var componentsLoaded = 0;
		components.forEach(function(c) {
			var result = c(me,componentLoaded);
			if (result !== componentLoaded) {
				componentLoaded();
			}
		});
		function componentLoaded() {
			componentsLoaded++;
			if (componentsLoaded === components.length) {
				setTimeout(start,0);
			}
		}
		this.components = components;
	}
	var p = Game.prototype;
	eventemitter._inherit(p);

	p.start = function() {
		if (this.isRunning) { throw 'Already started'; }
		var me = this;
		var runningToken = {};
		me.time = 0;
		me.running = runningToken;
		this.canvas.setAttribute('tabIndex', '0');
		this.canvas.focus();
		this.canvas.oncontextmenu = function() { return false; };

		var requestAnimationFrame =
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { window.setTimeout(callback, 1000 / 60); };

		var lastUpdate=new Date().getTime();
		requestAnimationFrame(update);

		function update() {
			var now=new Date().getTime();
			var dt = (now-lastUpdate)/1000;
			lastUpdate = now;
			dt = Math.min(1/30,dt);

			chain(me.chains.update,function(dt) {})(dt);

			me.time += dt;

			me.graphics.clear();

			chain(me.chains.draw,function(g) {})(me.graphics);

			if (me.running === runningToken) {
				requestAnimationFrame(update);
			}
		}
	};
	p.stop = function() {
		delete this.running;
	};
	return Game;
});
