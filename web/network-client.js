define(['./utils'],function(utils) {
	function NetworkClient(messenger,simulator) {
		this.messenger = messenger;
		this.simulator = simulator;
		this.messageHandlers = {
			initialize: handleInitialize.bind(this),
			reset: handleReset.bind(this),
			ack: handleAck.bind(this)
		};
		this.messenger.onmessage = handleMessage.bind(this);
		this.status = NetworkClient.STATUS_INITIALIZING;

		this.defaultgamerate = 1000*(1/30);
		this.latencySolving = 0;
	}

	function handleMessage(msg) {
		if (msg.frame && this.simulator.isFramePrehistoric(msg.frame)) {
			if (this.status === NetworkClient.STATUS_ACTIVE) {
				console.log('!DESYNC: got prehistoric frame',msg.frame,utils.JSONstringify(msg));
				this.status = NetworkClient.STATUS_RESETTING;
				this.messenger.send({
					type: 'resetrequest'
				});
			}
			return;
		}

		(this.messageHandlers[msg.type] || consolelog)(msg);
	}

	// General message handlers.
	function handleInitialize(msg) {
		this.clientid = msg.clientid;

		this.simulator.resetState(msg.state,msg.events);
		this.simulator.fastForward(msg.currentframe);

		console.log('Initialized');
		this.status = NetworkClient.STATUS_ACTIVE;

		update.call(this);

		this.syninterval = setInterval(synchronizeTime.bind(this),1000);
	}

	function handleReset(msg) {
		var simulator = this.simulator;
		console.log('!RESET:','to frame',msg.currentframe,'using frame',msg.state.frame,'and',msg.events.length,'events');
		this.status = NetworkClient.STATUS_ACTIVE;
		simulator.resetState(msg.state, msg.events);
		simulator.fastForward(msg.currentframe);
		clearTimeout(this.gameupdateTimeout);
		this.update();
	}
	function toMs(frames) {
		return frames*(1000/30);
	}
	function handleAck(msg) {
		var now = this.simulator.getCurrentFrame();
		var roundtripFrames = now - msg.oframe;
		var clientFrames = msg.oframe + roundtripFrames*0.5;
		var framesDifference = clientFrames - msg.nframe;
		this.simulator.forgetMomentsBefore(msg.stableframe);

		if (-framesDifference >= 30) {
			// We're too far behind compared to the server (1 second),
			// so we need to fast-forward to the frame of the server.

			// This can happen when frames aren't being updated by
			// the game. In browsers this can happen when the tab
			// is not active, so that setTimeout is not triggered.

			// Another possibility is a slow client, fast-forwarding
			// will help, since it will not draw these frames.

			console.log('Fast forwarding to', msg.nframe);
			this.simulator.fastForward(msg.nframe);
		} else {
			// console.log(framesDifference,now,msg.nframe);

			// How fast do we want to get to server's time
			this.latencySolvingFrames = 30;

			var newLatencySolving = toMs(framesDifference)/this.latencySolvingFrames;
			this.latencySolving = this.latencySolving*0.5+newLatencySolving*0.5;
			this.latencyMs = toMs(now-msg.oframe);
		}
	}

	function update() {
		if (this.latencySolvingFrames > 0) {
			this.latencySolvingFrames--;
			if (this.latencySolvingFrames === 0) {
				this.latencySolving = 0;
			}
		}
		this.gameupdateTimeout = setTimeout(update.bind(this),this.defaultgamerate+this.latencySolving);
		this.simulator.advanceToNextMoment();
	}
	function synchronizeTime() {
		this.messenger.send({
			type: 'syn',
			frame: this.simulator.getCurrentFrame()
		});
	}
	function stop() {
		clearTimeout(this.gameupdateTimeout);
	}
	(function(p) {
		NetworkClient.STATUS_ACTIVE = 0;
		NetworkClient.STATUS_INITIALIZING = 1;
		NetworkClient.STATUS_RESETTING = 2;

		p.update = update;
		p.stop = stop;
	})(NetworkClient.prototype);
	return NetworkClient;
});