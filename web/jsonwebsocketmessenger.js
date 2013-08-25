define(['./utils'],function(utils) {
	function JsonWebsocketMessenger(ws) {
		this.ws = ws;
		
		if (ws.on) {
			ws.on('message',latencySimulator(latency,handleWebsocketMessage.bind(this)));
			ws.on('close',handleWebsocketClose.bind(this));
		} else {
			ws.onmessage = latencySimulator(latency,handleWebsocketMessage.bind(this));
			ws.onclose = handleWebsocketClose.bind(this);
		}
	}
	function handleWebsocketMessage(event) {
		var data = event.utf8Data || event.data;
		// console.log('<',msg.type,data);
		var msg = utils.JSONparse(data);
		this.onmessage(msg);
	}
	function handleWebsocketClose() {
		this.onclose();
	}
	(function(p) {
		p.send = latencySimulator(latency,function(msg) {
			// console.log('>',msg.type,utils.JSONstringify(msg));
			this.ws.send(utils.JSONstringify(msg));
		});
		p.close = function() {
			this.ws.close();
		};
	})(JsonWebsocketMessenger.prototype);

	var simulateLatency = false;
	var simulateLatencyBase = 100;
	var simulateLatencyUnstability = 50;
	var simulateLatencySpikeAmount = 100;
	var simulateLatencySpikeOccurance = 0.01;

	function latency() {
		return simulateLatencyBase
			+  (Math.random()*simulateLatencyUnstability-simulateLatencyUnstability*0.5)
			+  (Math.random() < simulateLatencySpikeOccurance ? simulateLatencySpikeAmount : 0);
	}

	function latencySimulator(latency,cb) {
		var timeout = null;
		var queue = [];

		function push(/*...*/) {
			if (!simulateLatency) {
				return cb.apply(this,arguments);
			}
			queue.push({
				trigger: Date.now() + latency(),
				self: this,
				args: arguments
			});
			waitForDequeue();
		}

		function waitForDequeue() {
			if (queue.length > 0 && !timeout) {
				timeout = setTimeout(dequeue,queue[0].trigger - Date.now());
			}
		}

		function dequeue() {
			var now = Date.now();
			while (queue.length > 0 && queue[0].trigger <= now) {
				var queued = queue.shift();
				cb.apply(queued.self,queued.args);
			}
			timeout = null;
			waitForDequeue();
		}

		return push;
	}

	return JsonWebsocketMessenger;
});