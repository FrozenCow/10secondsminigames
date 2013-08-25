define(['eventemitter'],function(eventemitter) {
	function extend(a,b) {
		for(var n in b) { a[n] = b[n]; }
	}
	return function(rs) {
		var preloadStatus = {
			ready: 0,
			total: 0,
			errors: 0
		};
		extend(preloadStatus,eventemitter);

		var resources = {
			status: preloadStatus,
			images: {},
			audio: {},
			loadImage: loadImage,
			loadAudio: loadAudio
		};

		function loadImage(name,callback) {
			var me = this;
			var img = document.getElementById('image_'+name);
			if (img) {
				me.images[name] = img;
				return callback(null,img);
			}
			img = new Image();
			img.src = 'assets/'+name+'.png';
			img.onload = function() {
				me.images[name] = img;
				callback(null,img);
			};
			img.onerror = function() {
				callback('Could not load image '+name);
			};
			return img;
		}

		function loadAudio(name,callback) {
			var me = this;
			var isdone = false;
			var checkinterval = 10;
			var loadtime = 0;
			var a = document.getElementById('audio_'+name);
			if (a) {
				me.audio[name] = a;
				return callback(null,a);
			}
			a = new Audio('assets/'+name+'.wav');
			try {
				a.addEventListener('canplaythrough', markdone, false);
			} catch(e) { console.error(e); }
			function checkReady() {
				if (isdone) { return; }
				if (loadtime > 5000) {
					return callback('Could not load audio '+name);
				}
				if (a.readyState) {
					markdone();
				} else {
					loadtime += checkinterval;
					setTimeout(checkReady,checkinterval);
				}
			}
			function markdone() {
				a.removeEventListener('canplaythrough', markdone);
				isdone = true;
				me.audio[name] = a;
				callback(null,a);
			}
			checkReady();
		}

		var isPreloaded = false;
		var onpreloaded = null;
		preload(resources,rs,function(err) {
			if (err) { console.error(err); }
			isPreloaded = true;
			if (onpreloaded) { onpreloaded(); }
		});

		return function(g,callback) {
			g.resources = resources;
			if (!isPreloaded) {
				onpreloaded = callback;
				return callback;
			}
		};
	};

	function preload(resources,preloadResources,callback) {
		var me = this;
		var status = resources.status;

		function loadMultiple(type,loadfunction) {
			if (!preloadResources[type]) { return; }
			preloadResources[type].forEach(function(name) {
				status.total++;
				loadfunction.call(resources, name,onResourceLoaded);
			});
			if (preloadResources[type].length === 0) {
				onResourceLoaded(null);
			}
		}
		loadMultiple('images',resources.loadImage);
		loadMultiple('audio',resources.loadAudio);

		function onResourceLoaded(err) {
			if (err) {
				status.errors++;
				status.emit('changed');
				checkdone();
			} else {
				status.ready++;
				status.emit('changed');
				checkdone();
			}
		}

		function checkdone() {
			if (status.total <= status.ready+status.errors) {
				if (status.errors > 0) {
					callback('Not all resources were loaded');
				} else {
					callback();
				}
			}
		}
	}
});