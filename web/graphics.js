define(function() {
	function Graphics(context) {
		this.context = context;
	}
	var p = Graphics.prototype;
	p.clear = function() {
		this.save();
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, 9000, 9000);
		this.restore();
	};
	p.fillStyle = function(s) {
		if (s) { this.context.fillStyle = s; }
		else { return this.context.fillStyle; }
	};
	p.strokeStyle = function(s) {
		if (s) { this.context.strokeStyle = s; }
		else { return this.context.strokeStyle; }
	};
	p.lineWidth = function(s) {
		if (s) { this.context.lineWidth = s; }
		else { return this.context.lineWidth; }
	};
	p.circle = function(x,y,radius) {
		this.context.beginPath();
		this.context.arc(x, y, radius, 0, Math.PI*2, true);
		this.context.closePath();
	};
	p.rectangle = function(x,y,w,h) {
		this.context.rect(x,y,w,h);
	};
	p.roundRectangle = function(x,y,w,h,r) {
		var c = this.context;
		c.beginPath();
		c.moveTo(x+r,y);
		c.lineTo(x+w-r,y);
		c.arcTo(x+w,y, x+w,y+r, r);
		c.lineTo(x+w,y+h-r);
		c.arcTo(x+w,y+h, x+w-r,y+h, r);
		c.lineTo(x+r,y+h);
		c.arcTo(x,y+h, x,y+h-r, r);
		c.lineTo(x,y+r);
		c.arcTo(x,y, x+r,y, r);
	};
	p.polygon = function(points) {
		this.context.beginPath();
		if (points.length > 0) {
			this.context.moveTo(points[0].x,points[0].y);
			for(var i=1;i<points.length;i++) {
				this.context.lineTo(points[i].x,points[i].y);
			}
		}
		this.context.closePath();
	};
	p.strokePolygon = function(points) {
		this.polygon(points);
		this.context.stroke();
	};
	p.fillPolygon = function(points) {
		this.polygon(points);
		this.context.fill();
	};
	p.strokeRectangle = function(x,y,w,h) {
		this.context.strokeRect(x,y,w,h);
	};
	p.fillRectangle = function(x,y,w,h) {
		this.context.fillRect(x,y,w,h);
	};
	p.strokeRoundRectangle = function(x,y,w,h,r) {
		this.roundRectangle(x,y,w,h,r);
		this.context.stroke();
	};
	p.fillRoundRectangle = function(x,y,w,h,r) {
		this.roundRectangle(x,y,w,h,r);
		this.context.fill();
	};
	p.strokeCircle = function(x,y,radius) {
		this.circle(x,y,radius);
		this.context.stroke();
	};
	p.fillCircle = function(x,y,radius) {
		this.circle(x,y,radius);
		this.context.fill();
	};
	p.fillLoading = function(x,y,radius,fraction) {
		var c = this.context;
		var abegin = ((fraction*360)-90)*(Math.PI/180);
		var aend = (0-90)*(Math.PI/180);

		c.beginPath();
		c.moveTo(x,y);
		c.lineTo(x+Math.cos(abegin)*radius,y+Math.sin(abegin)*radius);
		c.arc(x,y,radius,abegin,aend,false);
		c.lineTo(x,y);
		c.closePath();
		c.fill();
	};
	p.line = function(x1,y1,x2,y2) {
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.closePath();
	};
	p.strokeLine = function(x1,y1,x2,y2) {
		this.line(x1,y1,x2,y2);
		this.context.stroke();
	};

	p.rotate = function(x,y,r,rotated) {
		this.save();
		this.context.translate(x,y);
		this.context.rotate(r);
		this.context.translate(-x,-y);
		rotated();
		this.restore();
	};
	p.scale = function(x,y,sx,sy,scaled) {
		this.save();
		this.context.translate(x,y);
		this.context.scale(sx,sy);
		this.context.translate(-x,-y);
		scaled();
		this.restore();
	};
	p.scalerotate = function(x,y,sx,sy,r,rotatedscaled) {
		this.save();
		this.context.translate(x,y);
		this.context.rotate(r);
		this.context.scale(sx,sy);
		this.context.translate(-x,-y);
		rotatedscaled();
		this.restore();
	};
	p.drawImage = function(img,sx,sy,sw,sh,dx,dy,dw,dh) {
		if (img) {
			this.context.drawImage.apply(this.context,arguments);
		}
	};
	p.drawCenteredImage = function(img,x,y) {
		if (img) {
			this.context.drawImage(img,x-img.width/2,y-img.height/2);
		}
	};
	p.fillCenteredText = function(text,x,y) {
		var size = this.context.measureText(text);
		this.context.fillText(text,x-size.width/2,y);
	};
	p.fillText = function(text,x,y) {
		this.context.fillText(text,x,y);
	};
	p.save = function() {
		if (!this._depth) { this._depth = 0; }
		this._depth++;
		this.context.save();
	};
	p.restore = function() {
		if (this._depth <= 0) { console.log('NOES'); throw "NOES"; }
		this.context.restore();
		this._depth--;
	};
	return Graphics;
});