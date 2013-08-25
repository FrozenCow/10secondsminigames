define(function() {
	function ParticleEmitter(image,max,spawnrate,initializeParticle,updateParticle) {
		var particles = this.particles = [];
		for(i=0;i<max;i++) {
			particles.push({active:false});
		}
		this.spawnrate = spawnrate;
		this.spawntime = spawnrate;
		this.initializeParticle = initializeParticle;
		this.updateParticle = updateParticle;
	}
	var p = ParticleEmitter.prototype;
	p['updatable'] = true;
	p['drawable'] = true;
	p.update = function(dt) {
		var particles = this.particles;
		var initializeParticle = this.initializeParticle;
		var updateParticle = this.updateParticle;

		this.spawntime -= dt;
		if (this.spawntime < 0) {
			this.spawntime += this.spawnrate;
			for(i=0;i<particles.length;i++) {
				if (!particles[i].active) {
					particles[i].active = true;
					initializeParticle(particles[i]);
					break;
				}
			}
		}
		for(i=0;i<particles.length;i++) {
			var p = particles[i];
			if (!p.active) { continue; }
			updateParticle(p,dt);
		}
	};
	p.draw = function(g) {
		var particles = this.particles;
		for(i=0;i<particles.length;i++) {
			var p = particles[i];
			if (!p.active) { continue; }
			g.context.globalAlpha = Math.min(1,p.time)*0.5;
			g.context.save();
			g.context.translate(p.posx, p.posy);
			g.context.rotate(p.rot);
			var s = (2-p.time)*0.3;
			g.context.scale(s,s);
			g.drawCenteredImage(image,0,0);
			g.context.restore();
			g.context.globalAlpha = 1;
		}
	};

	ParticleEmitter.defaultUpdate = function(p,dt) {
		p.time -= dt;
		if (p.time < 0) {
			p.active = false;
		}
		p.posx += p.velx*dt;
		p.posy += p.vely*dt;
		p.rot += p.rotrate*dt;
	};

	return ParticleEmitter;
});