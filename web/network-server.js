define(['./utils'],function(utils) {
	function test(f) {
		console.log('before');
		try {
			f();
		} catch(e) {
			console.log(e,e.stack);
		}
		console.log('after');
	}
	function NetworkServer(simulator) {
		this.simulator = simulator;
		this.clients = [];
		this.newclientid = 0;
		this.messageHandlers = {
			'syn': handleSyn,
			'ack': handleAck,
			'debug': handleDebug
		};
		this.defaultgamerate = 1000*(1/30);
		this.gameupdateTimeout = setTimeout(update.bind(this), this.defaultgamerate);
		this.stableframe = 0;
	}
	function update() {
		this.simulator.advanceToNextMoment();
		this.gameupdateTimeout = setTimeout(update.bind(this), this.defaultgamerate);
	}
	(function(p) {
		p.createClient = function(messenger) {
			var client = new Client();
			client.status = Client.STATUS_ACTIVE;
			client.id = this.newclientid++;
			client.server = this;
			client.messenger = messenger;
			client.lastframe = this.simulator.getCurrentFrame();
			this.clients.push(client);

			// Initialize client.
			this.simulator.pushEvent({
				type: 'connect',
				clientid: client.id
			});
			client.broadcast({
				type: 'connect',
				clientid: client.id,
				frame: this.simulator.getCurrentFrame()
			});
			client.messenger.send({
				type: 'initialize',
				clientid: client.id,
				state: this.simulator.getOldestState(),
				events: this.simulator.getEvents(),
				currentframe: this.simulator.getCurrentFrame()
			});

			messenger.onmessage = handleMessage.bind(client);
			messenger.onclose = handleDisconnect.bind(client);

			if (this.onclientadded) {
				this.onclientadded(client);
			}

			return client;
		};
		p.removeClient = function(client) {
			utils.remove(this.clients, client);
			if (this.onclientremoved) {
				this.onclientremoved(client);
			}
			if (this.clients.length === 0 && this.onempty) {
				this.onempty();
			}
		};
		p.broadcast = function(msg) {
			this.clients.forEach(function(client) {
				client.messenger.send(msg);
			});
		};
		p.recalculateStableFrame = function() {
			this.stableframe = this.clients
				.map(function(client) {
					return client.lastframe;
				})
				.reduce(function(a,b) {
					return Math.min(a,b);
				}, Infinity);
			this.simulator.forgetMomentsBefore(this.stableframe);
		};
		p.close = function() {
			clearTimeout(this.gameupdateTimeout);
		};
	})(NetworkServer.prototype);

	function handleMessage(msg) {
		if (msg.frame && msg.type !== 'syn' && this.server.simulator.isFramePrehistoric(msg.frame)) {
			console.log('Detected message from prehistoric frame',msg.frame,'from client',this.id);
			if (this.status === Client.STATUS_ACTIVE) {
				console.log('Disconnect from client',this.id);
				this.messenger.close();
			}
		} else {
			(this.server.messageHandlers[msg.type] || utils.identity).call(this,msg);
		}
	}

	function handleSyn(msg) {
		this.lastframe = msg.frame;
		this.server.recalculateStableFrame();
		this.messenger.send({
			type: 'ack',
			oframe: msg.frame,
			nframe: this.server.simulator.getCurrentFrame(),
			stableframe: this.server.stableframe
		});
	}
	function handleAck(msg) {
		this.latency = msg.latency;
	}
	function handleDebug(msg) {
		console.log(msg);
	}
	function handleDisconnect() {
		var simulator = this.server.simulator;
		simulator.pushEvent({
			type: 'disconnect',
			clientid: this.id
		});
		this.broadcast({
			type: 'disconnect',
			clientid: this.id,
			frame: simulator.getCurrentMoment().state.frame
		});
		this.server.removeClient(this);
		console.log('disconnected');
	}

	function Client() { }
	Client.STATUS_ACTIVE = 0;
	Client.STATUS_RESETTING = 2;
	(function(p) {
		p.broadcast = function(msg) {
			for(var k in this.server.clients) {
				var other = this.server.clients[k];
				if (other === this) { continue; }
				other.messenger.send(msg);
			}
		};
	})(Client.prototype);


	return NetworkServer;
});