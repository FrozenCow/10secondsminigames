define(function() {
	function Vector(x,y) {
		this.x = x;
		this.y = y;
	}
	var p = Vector.prototype;
	p.set = function(x,y) {
		this.x = x;
		this.y = y;
		return this;
	};
	p.add = function(x,y) {
		this.x += x;
		this.y += y;
		return this;
	};
	p.substract = function(x,y) {
		this.x -= x;
		this.y -= y;
		return this;
	};
	p.multiply = function(f) {
		this.x *= f;
		this.y *= f;
		return this;
	};
	p.divide = function(f) {
		this.x /= f;
		this.y /= f;
		return this;
	};
	p.length = function() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	};
	p.length2 = function() {
		return this.x*this.x+this.y*this.y;
	};
	p.distanceTo = function(x,y) {
		var dx = this.x-x;
		dx*=dx;
		var dy = this.y-y;
		dy*=dy;
		//console.log(dy);
		return Math.sqrt(dx+dy);
	};
	p.normalize = function() {
		var l = this.length();
		if (l === 0.0) { throw "Normalizing 0!"; }
		this.x /= l;
		this.y /= l;
		return this;
	};
	p.normalizeOr = function(x,y) {
		var l = this.length();
		if (l === 0.0) { this.x = x; this.y = y; return this; }
		this.x /= l;
		this.y /= l;
		return this;
	};
	p.normalizeOrZero = function() {
		return this.normalizeOr(0,0);
	};
	p.dot = function(x,y) {
		return this.x * x + this.y * y;
	};
	p.negate = function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	};
	p.normalRight = function() {
		var tmp = this.x;
		this.x = -this.y;
		this.y = tmp;
		return this;
	};
	p.normalLeft = function() {
		var tmp = this.x;
		this.x = this.y;
		this.y = -tmp;
		return this;
	};
	p.equals = function(x,y) {
		return this.x === x && this.y === y;
	};
	p.toString = function() {
		return 'Vector(' + this.x + ',' + this.y + ')';
	};
	p.rotate = function(r) {
		var l = this.length();
		r = Math.atan2(this.y, this.x)+r;
		this.x = Math.cos(r)*l;
		this.y = Math.sin(r)*l;
		return this;
	};
	p.angleToward = function(x,y) {
		var a1 = Math.atan2(this.y, this.x);
		var a2 = Math.atan2(y, x);

		if (a1 < -Math.PI / 2 && a2 > Math.PI / 2) a1 += Math.PI * 2;
		if (a2 < -Math.PI /2 && a1 > Math.PI / 2) a2 += Math.PI * 2;

		return a2 - a1;
	};
	p.clone = function() {
		return new Vector(this.x, this.y);
	};

	// Add helper vector-functions.
	function unzipV(f) {
		return function(v) {
			return f.call(this,v.x,v.y);
		};
	}
	p.setV = unzipV(p.set);
	p.addV = unzipV(p.add);
	p.substractV = unzipV(p.substract);
	p.multiplyV = unzipV(p.multiply);
	p.divideV = unzipV(p.divide);
	p.normalizeOrV = unzipV(p.normalizeOr);
	p.dotV = unzipV(p.dot);
	p.equalsV = unzipV(p.equals);
	p.distanceToV = unzipV(p.distanceTo);

	Vector.zero = new Vector(0,0);
	Vector.xaxis = new Vector(1,0);
	Vector.yaxis = new Vector(0,1);

	Vector.distanceBetween = function(x1,y1, x2,y2) {
		var dx = x1-x2;
		dx*=dx;
		var dy = y1-y2;
		dy*=dy;
		return Math.sqrt(dx+dy);
	};

	return Vector;
});