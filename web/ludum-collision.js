define(['linesegment','vector'],function(LineSegment,Vector) {
	var t = new Vector();
	var t2 = new Vector();
	function createBox(points) {
		var lineSegments = [];
		var prevPoint = points[points.length-1];
		points.forEach(function(point) {
			lineSegments.push(new LineSegment(prevPoint.x, prevPoint.y, point.x, point.y));
			prevPoint = point;
		});
		return lineSegments;
	}
	function getLineCollisions(o,radius, lineSegments, collisions) {
		for(var i=0;i<lineSegments.length;i++) {
			var lineSegment = lineSegments[i];
			if (lineSegment.normal.dot(o.vx,o.vy) > 0) {
				continue;
			}
			t.setV(lineSegment.normal);
			t.normalRight();
			var l = lineSegment.start.distanceToV(lineSegment.end);
			t2.set(o.x,o.y);
			t2.substractV(lineSegment.start);
			var offY = lineSegment.normal.dotV(t2)-radius;
			var offX = t.dotV(t2);
			if (offY < -radius*2) {
				continue;
			} else if (offY < 0) {
				var d;
				if (offX > 0 && offX < l) {
					offY*=-1;
					collisions.push({
						object: lineSegment,
						normal: lineSegment.normal,
						offset:offY
					});
				} else if (offX < 0 && offX > -radius) {
					d = lineSegment.start.distanceTo(o.x,o.y);
					if (d < radius) {
						t.set(o.x,o.y);
						t.substractV(lineSegment.start);
						t.normalize();
						collisions.push({
							object: lineSegment,
							normal: lineSegment.normal,
							offset:radius-d
						});
					}
				} else if (offX > l && offX < l+radius) {
					d = lineSegment.end.distanceTo(o.x,o.y);
					if (d < radius) {
						t.set(o.x,o.y);
						t.substractV(lineSegment.end);
						t.normalize();
						collisions.push({
							object: lineSegment,
							normal: lineSegment.normal,
							offset:radius-d
						});
					}
				}
			} else {
				continue;
			}
		}
	}

	function offsetComparer(a,b) {
		return b.offset-a.offset;
	}

	function handleLineCollision(o,radius,bounciness, collisionlines, resultcollisions) {
		for(var iteration=0;iteration<5;iteration++) {
			var collisions = [];
			
			getLineCollisions(o,radius,collisionlines,collisions);
			if (collisions.length > 0) {
				collisions.sort(offsetComparer);
				var c = collisions[0];
				//offset-=1;
				t.set(o.x,o.y);
				t.add(c.normal.x*c.offset,c.normal.y*c.offset);
				o.x = t.x; o.y = t.y;
				var vc = c.normal.dot(o.vx,o.vy);

				t.set(o.vx,o.vy);
				t.substract((1+bounciness)*c.normal.x*vc, (1+bounciness)*c.normal.y*vc);
				o.vx = t.x; o.vy = t.y;

				resultcollisions.push(collisions[0]);
			} else {
				break;
			}
		}
	}

	function handleCircleCollision(pa,massa,radiusa, pb,massb,radiusb, bounciness) {
		t.set(pa.x,pa.y);
		t.substract(pb.x,pb.y);
		var l = t.length();
		if (l < radiusa+radiusb) {
			var totalmass = massa+massb;
			t.normalizeOrZero();

			// Reposition
			var penetrationLength = radiusa+radiusb-l-1;
			pa.x += penetrationLength*t.x*(massb/totalmass);
			pa.y += penetrationLength*t.y*(massb/totalmass);

			pb.x -= penetrationLength*t.x*(massa/totalmass);
			pb.y -= penetrationLength*t.y*(massa/totalmass);

			// Bounce
			var d = t.dot(pa.vx-pb.vx,pa.vy-pb.vy);
			if (d < 0) {
				t.multiply(d * (1 + bounciness));
				pa.vx -= t.x*(massb/totalmass);
				pa.vy -= t.y*(massb/totalmass);

				pb.vx += t.x*(massa/totalmass);
				pb.vy += t.y*(massa/totalmass);
			}
			return {
				object: pa,
				normal: t.clone(),
				bounced: d < 0
			};
		}
		return null;
	}

	function handleCollision(collidables, collisionlines) {
		var collidableCollisions = collidables.map(function(collidable) { return [collidable, []]; });
		for(var i=0;i<5;i++) { // Try to resolve collisions 5 times
			var collisionResolved = true;
			collidableCollisions.forEach(function(collidableCollision) {
				var collidable = collidableCollision[0];
				var collisions = collidableCollision[1];
				var collisionCount = collisions.length;
				handleLineCollision(collidable, 20, 0.0, collisionlines, collisions);

				var pa = collidable;
				collidableCollisions.forEach(function(collidableCollisionB) {
					if (collidableCollision === collidableCollisionB) { return; }
					var pb = collidableCollisionB[0];
					var collision = handleCircleCollision(pa,1,20, pb,1,20, 0.0);
					if (collision) {
						collidableCollision[1].push(collision);
						collidableCollisionB[1].push({
							object: pa,
							normal: collision.normal.clone().negate()
						});
					}
				});

				if (collisionCount !== collisions.length) {
					collisionResolved = false;
				}
			});

			if (collisionResolved) {
				break;
			}
		}
		return collidableCollisions;
	}

	return {
		createBox: createBox,
		handleLineCollision: handleLineCollision,
		handleCollision: handleCollision
	};
});