define(['vector'],function(Vector) {
	return function(game) {
		game.objects.lists.collide = game.objects.createIndexList('collide');
		game.objects.lists.collidable = game.objects.createIndexList('collidable');
		game.on('postupdate',function() {
			game.emit('precollision');
			handleCollision();
			game.emit('postcollision');
		});

		function handleCollision() {
			var t = new Vector(0,0);
			var t2 = new Vector(0,0);
			
			var collisionlines = [];
			game.objects.lists.collidable.each(function(o) {
				collisionlines = collisionlines.concat(o.collisionlines);
			});

			game.objects.lists.collide.each(function(o) {
				if (!o.velocity){return;}
				o.surfaces = [];
				for(var iteration=0;iteration<5;iteration++) {
					var collisions = [];
					function handleCollisionLineSegments(lineSegments) {
						for(var i=0;i<lineSegments.length;i++) {
							var lineSegment = lineSegments[i];
							if (lineSegment.normal.dotV(o.velocity) > 0) {
								continue;
							}
							t.setV(lineSegment.normal);
							t.normalRight();
							var l = lineSegment.start.distanceToV(lineSegment.end);
							t2.setV(o.position);
							t2.substractV(lineSegment.start);
							var offY = lineSegment.normal.dotV(t2)-o.collisionRadius;
							var offX = t.dotV(t2);
							if (offY < -o.collisionRadius*2) {
								continue;
							} else if (offY < 0) {
								var d;
								if (offX > 0 && offX < l) {
									offY*=-1;
									collisions.push({
										lineSegment: lineSegment,
										offset:offY
									});
								} else if (offX < 0 && offX > -o.collisionRadius) {
									d = o.position.distanceToV(lineSegment.start);
									if (d < o.collisionRadius) {
										t.setV(o.position);
										t.substractV(lineSegment.start);
										t.normalize();
										collisions.push({
											lineSegment: lineSegment,
											offset:o.collisionRadius-d
										});
									}
								} else if (offX > l && offX < l+o.collisionRadius) {
									d = o.position.distanceToV(lineSegment.end);
									if (d < o.collisionRadius) {
										t.setV(o.position);
										t.substractV(lineSegment.end);
										t.normalize();
										collisions.push({
											lineSegment: lineSegment,
											offset:o.collisionRadius-d
										});
									}
								}
							} else {
								continue;
							}
						}
					}
					handleCollisionLineSegments(collisionlines);
					if (collisions.length > 0) {
						collisions.sort(function(a,b) {
							return b.offset-a.offset;
						});
						var c = collisions[0];
						//offset-=1;
						o.position.add(c.lineSegment.normal.x*c.offset,c.lineSegment.normal.y*c.offset);
						var vc = o.velocity.dotV(c.lineSegment.normal);
						o.velocity.substract(c.lineSegment.normal.x*vc, c.lineSegment.normal.y*vc);
						o.surfaces.push(c);
						o.collide(c);
					} else {
						o.surface = null;
						break;
					}
				}
			});
		}
	};
});