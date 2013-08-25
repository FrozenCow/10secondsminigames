var express = require('./express-ws');

var requirejs = require('requirejs');
requirejs.config({
	baseUrl: './web',
	nodeRequire: require,
	catchError: true
});


// requirejs.onError = onRJSerror;
// function onRJSerror(err) {
// 	while (err) {
// 		console.error(err);
// 		console.error(err.stack);
// 		err = err.originalError;
// 	}
// }

requirejs(['utils','simulator','ludum','jsonwebsocketmessenger','network-server'],function(utils,Simulator,game,JsonWebsocketMessenger,NetworkServer) {

var app = express();

app.use(express.static('web'));

var rooms = [];
var roomLookup = {};

function createRoom(name) {
	var simulator = new Simulator(game);
	var networkServer = new NetworkServer(simulator);
	networkServer.messageHandlers['up'] = handleKeyMsg;
	networkServer.messageHandlers['down'] = handleKeyMsg;
	networkServer.messageHandlers['setname'] = handleSetname;
	var room = {
		name: name,
		simulator: simulator,
		networkServer: networkServer
	};
	networkServer.onclientremoved = onClientRemoved.bind(room);
	networkServer.onempty = onRoomEmpty.bind(room);

	rooms.push(room);
	roomLookup[room.name] = room;
	onRoomAdded(room);

	return room;
}

function getRoom(name) {
	return roomLookup[name];
}

function createClientInRoom(ws,room) {
	var networkServer = room.networkServer;
	var messenger = new JsonWebsocketMessenger(ws);
	var client = networkServer.createClient(messenger);

	networkServer.clients.forEach(function(other) {
		if (other === client) { return; }
		if (!other.name) { return; }
		client.messenger.send({
			type: 'setname',
			clientid: other.id,
			name: other.name
		});
	});

	return client;
}
function onClientRemoved() {
	var room = this;
	if (room.networkServer.clients.length > 0) {
		onRoomUpdated(room);
	}
}
function onRoomEmpty() {
	var room = this;
	room.networkServer.close();

	utils.remove(rooms,room);
	delete roomLookup[room.name];
	onRoomRemoved(room);
}
function getRoomViewModel(room) {
	return {
		name: room.name,
		players: room.networkServer.clients.length
	};
}
function onRoomAdded(room) {
	roomWatchers.forEach(function(watcher) {
		watcher.send({
			type: 'add',
			room: getRoomViewModel(room)
		});
	});
}
function onRoomUpdated(room) {
	roomWatchers.forEach(function(watcher) {
		watcher.send({
			type: 'update',
			room: getRoomViewModel(room)
		});
	});
}
function onRoomRemoved(room) {
	roomWatchers.forEach(function(watcher) {
		watcher.send({
			type: 'remove',
			name: room.name
		});
	});
}
function handleKeyMsg(msg) {
	var simulator = this.server.simulator;
	simulator.insertEvent(msg.frame,{
		type: msg.type,
		clientid: this.id,
		key: msg.key,
		countid: msg.countid
	});
	if (msg.frame < simulator.moments[simulator.moments.length-1].state.frame) {
		msg.frame = simulator.moments[simulator.moments.length-1].state.frame;
		console.log('Detected old message from client',this.id);
		sendReset();
	}
	this.broadcast({
		type: msg.type,
		clientid: this.id,
		key: msg.key,
		frame: msg.frame,
		countid: msg.countid
	});
}

function handleSetname(msg) {
	if (/^[a-zA-Z0-9_\-\.]{1,5}$/.test(msg.name)) {
		// Name is accepted, send it to other clients.
		this.name = msg.name;
		this.broadcast({
			type: msg.type,
			clientid: this.id,
			name: msg.name
		});
	} else {
		// Chosen name is invalid, send old name back to client.
		this.messenger.send({
			type:'setname',
			clientid:this.id,
			name:this.name
		});
	}
}

app.ws.usepath('/room',function(req,next) {
	var roomName = req.query.name;
	var newRoom = false;
	var room = getRoom(roomName) || ((newRoom = true) && createRoom(roomName));

	if (!utils.contains(req.requestedProtocols,'game')) { console.log('Rejected'); return req.reject(); }
	console.log('connected');
	var ws = req.accept('game',req.origin);

	createClientInRoom(ws,room);

	if (!newRoom) {
		onRoomUpdated(room);
	}
});

var roomWatchers = [];
app.ws.usepath('/rooms',function(req,next) {
	if (!utils.contains(req.requestedProtocols,'rooms')) { console.log('Rejected'); return req.reject(); }
	var ws = req.accept('rooms',req.origin);
	var messenger = new JsonWebsocketMessenger(ws);
	messenger.send({
		type:'init',
		rooms:rooms.map(getRoomViewModel)
	});
	messenger.onclose = function() {
		utils.remove(roomWatchers,messenger);
	};
	roomWatchers.push(messenger);
});

app.listen(8085);

function update() {
	var tf = simulator.getCurrentMoment();
	process.stdout.write('\r' + [
		'@'+tf.state.frame,
		'!'+simulator.futureEvents.length,
		'|'+simulator.moments.length,
		':'+tf.state.players.length,
		'*'+tf.events.length,
		tf.state.players.map(function(player) {
			return '('+Math.round(player.x)+','+Math.round(player.y)+')';
		}).join(' ')
		].join(' '));
	updateGame();

	// Trim moments that will never be used (the oldest moment in use by any client)
	var minimalframe = clients.reduce(function(prev,client) {
		return client.lastframe < prev ? client.lastframe : prev;
	},simulator.getCurrentFrame());
	while (simulator.moments.length > 0 && simulator.moments[simulator.moments.length-1].state.frame < minimalframe) {
		simulator.moments.pop();
	}
	/*var curframe = getCurrentMoment().state.frame;
	clients.forEach(function(client) {
		if (curframe - client.lastsyn < 30) { return; }
		client.lastsyn = curframe;
		client.messenger.send({
			type: 'syn',
			frame: curframe
		});
	});*/
}

// setInterval(update,1000*(1/30));


process.on('uncaughtException', function (err) {
	console.dir(err,'--',err.stack);
	throw err;
});

});