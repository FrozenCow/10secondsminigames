(function() {

var m = function(Vector) {
	function LineSegment(startx, starty, endx, endy) {
		this.start = new Vector(startx, starty);
		this.end = new Vector(endx, endy);
		this.normal = new Vector(0,0);
		this.recalculate();
	}
	var p = LineSegment.prototype;
	p.recalculate = function() {
		var n = this.normal;
		n.setV(this.end);
		n.substractV(this.start);
		this.length = n.length();
		n.normalize();
		n.normalLeft();
	};
	return LineSegment;
};

try {
	module.exports = m(require('./vector'));
} catch(e) {
	define(['./vector'],m);
}

})();