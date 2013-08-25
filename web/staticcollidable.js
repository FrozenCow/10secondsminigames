define(['vector','linesegment'],function(Vector,LineSegment) {
	function pointsToSegments(points) {
		// Create segments from points.
		var lineSegments = [];
		var prevPoint = points[points.length-1];
		points.forEach(function(point) {
			lineSegments.push(new LineSegment(prevPoint.x, prevPoint.y, point.x, point.y));
			prevPoint = point;
		});

		return lineSegments;
	}

	function StaticCollidable(points,inverted) {
		this.inverted = inverted;
		this.collisionlines = pointsToSegments(points);
		function max(a,f) {
			var r = null;
			a.forEach(function(e) {
				if (!r || f(e,a)) {
					r= e;
				}
			});
			return r;
		}
		this.bounds = {
			left: max(points, function(a,b) { return a.x < b.x; }).x,
			right: max(points, function(a,b) { return a.x > b.x; }).x,
			top: max(points, function(a,b) { return a.y < b.y; }).y,
			bottom: max(points, function(a,b) { return a.y > b.y; }).y
		};
		this.position = new Vector((this.bounds.left+this.bounds.right)/2,(this.bounds.top+this.bounds.bottom)/2);
	}
	StaticCollidable.prototype['collidable'] = true;
	return StaticCollidable;
});
