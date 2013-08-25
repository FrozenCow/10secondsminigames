define(['platform','game','vector','staticcollidable','linesegment','editor','required','state','level','mouse','collision','keyboard','quake','resources','graphics',
		'simulator','jsonwebsocketmessenger','network-client','ludum'
	],function(platform,Game,Vector,StaticCollidable,LineSegment,editor,required,state,level,mouse,collision,keyboard,quake,resources,Graphics,
		Simulator,JsonWebsocketMessenger,NetworkClient,ludumGame
	) {
	var t = new Vector(0,0);
	var t2 = new Vector(0,0);
	var rs = {
		'images': ['ball','box','check','fault','happy','sad'],
		'audio': []
	};

	var g;
	platform.once('load',function() {
		var canvas = document.getElementById('main');
		g = new Game(startGame, canvas, [required(['chrome']),mouse,keyboard,resources(rs),state,level,collision,quake]);
		g.resources.status.on('changed',function() {
			g.graphics.context.clearRect(0,0,800,600);
			g.graphics.context.fillStyle = 'black';
			g.graphics.context.font = 'arial';
			g.graphics.fillCenteredText('Preloading ' + g.resources.status.ready + '/' + g.resources.status.total + '...',400,300);
		});
	});

	function startGame(err) {
	if (err) { console.error(err); }
	var images = g.resources.images;
	var audio = g.resources.audio;

	g.objects.lists.particle = g.objects.createIndexList('particle');
	g.objects.lists.spring = g.objects.createIndexList('spring');
	g.objects.lists.start = g.objects.createIndexList('start');
	g.objects.lists.finish = g.objects.createIndexList('finish');
	g.objects.lists.enemy = g.objects.createIndexList('enemy');
	g.objects.lists.usable = g.objects.createIndexList('usable');
	g.objects.lists.collectable = g.objects.createIndexList('collectable');
	g.objects.lists.shadow = g.objects.createIndexList('shadow');

	function safeRefresh() {
		if (!safeRefresh.disconnectMessage) {
			var disconnectMessage = safeRefresh.disconnectMessage = document.createElement('div');
			disconnectMessage.appendChild(document.createTextNode('Disconnected'));
			document.body.appendChild(disconnectMessage);
		}

		function pollConnection() {
			var r = new XMLHttpRequest();
			r.open("GET", "/", true);
			r.onreadystatechange = function () {
				if (r.readyState != 4 || r.status != 200) {
					setTimeout(pollConnection,1000);
				} else {
					window.location.reload(true);
				}
			};
			r.send();
		}
		pollConnection();
	}

	// Auto-refresh
	// (function() {
	// 	var timeout = setTimeout(function() {
	// 		safeRefresh();
	// 	}, 3000);
	// 	g.once('keydown',function() {
	// 		disable();
	// 	});
	// 	g.once('mousemove',function() {
	// 		disable();
	// 	});
	// 	g.chains.draw.push(draw);
	// 	function draw(g,next) {
	// 		g.fillStyle('#ff0000');
	// 		g.fillCircle(800,0,30);
	// 		g.fillStyle('black');
	// 		next(g);
	// 	}
	// 	function disable() {
	// 		clearTimeout(timeout);
	// 		g.chains.draw.remove(draw);
	// 	}
	// })();

	function consolelog(/*...*/) {
		console.log.apply(console,arguments);
	}

	function getWebsocketUrl(path) {
		return (window.location.protocol === 'https:'
			? 'wss:'
			: 'ws:') + '//' + window.location.host + '/' + path;
	}

	function connectingState() {
		var me = {
			enabled: false,
			enable: enable,
			disable: disable
		};
		function enable() {
			var ws = new WebSocket(getWebsocketUrl('room?name='+window.location.hash.substr(1)), 'game');
			ws.onopen = function() {
				g.changeState(gameplayState(ws));
			};
			ws.onclose = function() {
				safeRefresh();
			};
		}
		function disable() {

		}
		function draw(g,next) {
			g.fillCircle(100,100,50);
			next(g);
		}
		return me;
	}

	function gameplayState(ws) {
		var me = {
			enabled: false,
			enable: enable,
			disable: disable
		};
		var messenger = new JsonWebsocketMessenger(ws);
		var simulator = new Simulator(ludumGame);
		var networkClient = new NetworkClient(messenger,simulator);

		var playernames = {};

		// HACK
		ludumGame.draw.playernames = playernames;
		ludumGame.draw.images = images;

		var playername = document.getElementById('playername');
		playername.onclick = function() {
			playernameInput.value = playername.innerText;
			playername.style.display = 'none';
			playernameInput.style.display = 'inline';
			playernameInput.focus();
			playernameInput.select();
		};
		var playernameInput = document.getElementById('playernameInput');
		playernameInput.onkeydown = function(event) {
			if (event.keyCode === 13 && playernameInput.value !== '') {
				setName(playernameInput.value);
				playername.innerText = playernameInput.value;
				playernameInput.style.display = 'none';
				playername.style.display = 'inline';
			}
		};
		var messagesBox = document.getElementById('messagesBox');
		var sendMessageBox = document.getElementById('sendMessageBox');
		sendMessageBox.onkeydown = function(event) {
			if (event.keyCode === 13 && sendMessageBox.value !== '') {
				chat(sendMessageBox.value);
				sendMessageBox.value = '';
			}
		};

		messenger.onclose = function() {
			networkClient.stop();
			safeRefresh();
		};

		function setName(name) {
			playernames[networkClient.clientid] = name;
			messenger.send({
				type: 'setname',
				name: name
			});
		}

		function chat(msg) {
			messenger.send({
				type: 'chat',
				text: msg
			});
		}

		function getPlayer() {
			return simulator.getCurrentState().players.filter(function(player) {
				return player.clientid === networkClient.clientid;
			})[0];
		}

		// Hook game-specific message handlers.
		(function(h) {
			h['setname'] = function(msg) {
				if (msg.clientid === networkClient.clientid) {
					playername.innerText = msg.name;
				}
				playernames[msg.clientid] = msg.name;
			};
			h['chat'] = function(msg) {
				console.log('Received chat', msg);
				var line = document.createElement('div');
				line.innerText = playernames[msg.clientid] + ': ' + msg.text;
				messagesBox.appendChild(line);
				messagesBox.scrollTop = messagesBox.scrollHeight;
			};
			h['connect'] = function(msg) {
				simulator.insertEvent(msg.frame,{
					type: 'connect',
					clientid: msg.clientid
				});
			};
			h['disconnect'] = function(msg) {
				simulator.insertEvent(msg.frame,{
					type: 'disconnect',
					clientid: msg.clientid
				});
			};
			h['up'] = function(msg) {
				simulator.insertEvent(msg.frame,{
					type: 'up',
					clientid: msg.clientid,
					key: msg.key,
					countid: msg.countid
				});
			};
			h['down'] = function(msg) {
				simulator.insertEvent(msg.frame,{
					type: 'down',
					clientid: msg.clientid,
					key: msg.key,
					countid: msg.countid
				});
			};
		})(networkClient.messageHandlers);

		var counter = 0;
		function inputEvent(event) {
			if (networkClient.status !== NetworkClient.STATUS_ACTIVE) { return; }
			var moment = simulator.getCurrentMoment();
			simulator.pushEvent(Object.merge({
				clientid: networkClient.clientid
			},event));
			messenger.send(Object.merge({
				frame: moment.state.frame
			},event));
		}
		function keydown(key) {
			inputEvent({
				type: 'down',
				key: key,
				countid: counter++
			});
		}
		function keyup(key) {
			inputEvent({
				type: 'up',
				key: key,
				countid: counter++
			});
		}
		function mousedown(button) {
		}

		function enable() {
			g.chains.draw.push(draw);
			g.on('mousedown',mousedown);
			g.on('keydown',keydown);
			g.on('keyup',keyup);
		}
		function disable() {
			g.chains.draw.remove(draw);
			g.removeListener('mousedown',mousedown);
			g.removeListener('keydown',keydown);
			g.removeListener('keyup',keyup);
		}

		function defaultHash(v) {
			return v.id || v.toString();
		}
		function memoize(f,hash){
			hash = hash || defaultHash;
			var cache = {};
			return function(/*...*/){
				var key = Array.prototype.map.call(arguments,hash).join('|');
				if(key in cache) {
					console.log('Cache hit for '+key);
					return cache[key];
				} else {
					console.log('Cache miss for '+key);
					return cache[key] = f.apply(this,arguments);
				}
			};
		};

		function draw(graphics) {
			var state = simulator.getCurrentState();
			ludumGame.draw(graphics, state);
		}
		return me;
	}

	g.changeState(connectingState());

	g.start();
	}
});
