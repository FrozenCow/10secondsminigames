define(['./utils','./vector','./linesegment','ludum-collision','minigame-touchtheball'],function(utils,Vector,LineSegment,collision,touchtheball) {
	function initializeGame() {
		return {
			frame: 0,
			players: [],
			state: initializeMinigameState(null)
		};
	}

	function initializePlayer(clientid) {
		return {
			x: 400, y: 300,
			vx: 0, vy: 0,
			keys: {},
			clientid: clientid
		};
	}

	function findPlayer(state,clientid) {
		for(var i=0;i<state.players.length;i++) {
			if (state.players[i].clientid === clientid) {
				return state.players[i];
			}
		}
	}

	var minigames = {
		'touchtheball': touchtheball
	};
	function pickMinigameType(state) {
		return 'touchtheball';
	}

	var collisionlines = collision.createBox([
		new Vector(0,0),
		new Vector(0,600),
		new Vector(800,600),
		new Vector(800,0)
	]);

	function getCollisionLines(state) {
		return collisionlines;
	}

	function initializeMinigameState(gamestate) {
		var minigameType = pickMinigameType(gamestate && gamestate.frame || 0)
		return {
			type: 'minigame',
			state: minigames[minigameType].initialize(gamestate && gamestate.players || [])
		};
	}

	function updateMinigameState(gamestate,state) {
		return {
			type: 'minigame',
			state: minigames[state.state.type].update(gamestate, state.state)
		};
	}

	function initializePostgameState(gamestate) {
		return {
			type: 'postgame',
			scores: minigames[gamestate.state.state.type].getScores(gamestate.state.state)
		};
	}

	function updatePostgameState(gamestate,state) {
		return state;
	}

	var stateUpdaters = {
		'postgame': updatePostgameState,
		'minigame': updateMinigameState
	};

	function updateGame(oldstate,events) {
		var state = utils.deepClone(oldstate);

		state.frame++;
		var totalSeconds = state.frame / 30;
		//  minigame    postgame
		// |____10_____|_3_|
		if (totalSeconds % 13 === 0) {
			state.state = initializeMinigameState(oldstate);
		} else if (totalSeconds % 13 === 10) {
			state.state = initializePostgameState(oldstate);
		} else {
			state.state = stateUpdaters[oldstate.state.type](oldstate, oldstate.state);
		}

		// Handle events.
		events.forEach(function(event) {
			({
				down: function(state,event) {
					findPlayer(state, event.clientid).keys[event.key] = 1;
				},
				up: function(state,event) {
					var player = findPlayer(state, event.clientid);
					delete player.keys[event.key];
				},
				connect: function(state,event) {
					state.players.push(initializePlayer(event.clientid));
				},
				disconnect: function(state,event) {
					utils.remove(state.players, findPlayer(state, event.clientid));
				}
			}[event.type])(state,event);
		});

		events.forEach(function(event) {
			switch(event.type) {
				case 'down':
					switch (event.key) {
						case 'x':
							var player = findPlayer(state, event.clientid);
							if (player.onground) {
								player.vy += -15;
							}
						break;
					}
				break;
			}
		});

		// Player controls
		state.players.forEach(function(player) {
			player.vx *= 0.3;
			player.vx += ((player.keys.right?1:0)-(player.keys.left?1:0))*5;
		});

		// Player gravity
		state.players.forEach(function(player) {
			player.vy += 1;
			player.vx *= 0.99;
		});

		// Player velocity
		state.players.forEach(function(player) {
			player.x += player.vx;
			player.y += player.vy;
		});

		// Collision
		var collisionLines = getCollisionLines(state);
		var collisions = collision.handleCollision(state.players,collisionLines);
		collisions.forEach(function(pair) {
			var player = pair[0];
			var playerCollisions = pair[1];
			player.onground = playerCollisions.reduce(function(result,collision) {
				return result || collision.normal.dot(0,1) < 0;
			},false);
		});

		return state;
	}

	return {
		init: initializeGame,
		update: updateGame
	};
});