define(['./utils','./vector','./linesegment','ludum-constants','ludum-collision','ludum-minigames'],function(utils,Vector,LineSegment,constants,collision,minigames) {
	function initializeGame() {
		return {
			frame: 0,
			players: [],
			state: initializeWaitState(null,30*1)
		};
	}

	function initializePlayer(clientid) {
		return {
			x: 400, y: 300,
			vx: 0, vy: 0,
			keys: {},
			clientid: clientid,
			score: 0
		};
	}

	function findPlayer(state,clientid) {
		for(var i=0;i<state.players.length;i++) {
			if (state.players[i].clientid === clientid) {
				return state.players[i];
			}
		}
	}

	function pickMinigameType(frame) {
		return utils.randomElement(frame,Object.keys(minigames));
	}

	function getCollisionLines(gamestate) {
		var r = constants.outerbox;
		if (gamestate.state.type === 'minigame' && minigames[gamestate.state.state.type].collisionlines) {
			r = r.concat(minigames[gamestate.state.state.type].collisionlines);
		}
		return r;
	}

	function initializeMinigameState(gamestate,minigameState) {
		return {
			type: 'minigame',
			time: 30*10,
			state: minigameState
		};
	}

	function updateMinigameState(gamestate,state,boxcollisions,playercollisions) {
		if (state.time === 1) {
			return initializePostgameState(gamestate);
		}
		return {
			type: 'minigame',
			time: state.time-1,
			state: minigames[state.state.type].update(gamestate, state.state,boxcollisions,playercollisions)
		};
	}

	function initializePostgameState(gamestate) {
		return {
			type: 'postgame',
			time: 30*3,
			scores: minigames[gamestate.state.state.type].getScores(gamestate.state.state)
		};
	}

	function updatePostgameState(gamestate,state) {
		if (state.time === 1) {
			return initializePregameState(gamestate);
		}
		return {
			type: state.type,
			scores: state.scores.map(utils.identity),
			time: state.time-1
		};
	}

	function initializePregameState(gamestate) {
		var minigameType = pickMinigameType(gamestate && gamestate.frame || 0);
		var minigameState = minigames[minigameType].initialize(gamestate);
		return {
			type: 'pregame',
			time: 30*3,
			minigameState: minigameState
		};
	}

	function updatePregameState(gamestate,state) {
		if (state.time === 1) {
			return initializeMinigameState(state.minigame,state.minigameState);
		}
		return {
			type: state.type,
			minigameState: state.minigameState,
			time: state.time-1
		};
	}

	function initializeWaitState(gamestate,time) {
		return {
			type: 'wait',
			time: time
		};
	}

	function updateWaitState(gamestate,state) {
		if (state.time === 1) {
			return initializePregameState(gamestate);
		}
		return {
			type: state.type,
			time: state.time-1
		};
	}

	var stateUpdaters = {
		'wait': updateWaitState,
		'pregame': updatePregameState,
		'minigame': updateMinigameState,
		'postgame': updatePostgameState
	};

	function updateGame(oldstate,events) {
		var state = utils.deepClone(oldstate);

		state.frame++;

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
		var boxcollisions = {};
		var playercollisions = {};
		collisions.forEach(function(pair) {
			var player = pair[0];
			var playerCollisions = pair[1];
			boxcollisions[player.clientid] = [];
			playercollisions[player.clientid] = [];
			player.onground = playerCollisions.reduce(function(result,collision) {
				if (collision.object.box !== undefined && collision.normal.dot(0,1) < 0) {
					boxcollisions[player.clientid].push(collision.object);
				}
				if (collision.object.clientid !== undefined) {
					playercollisions[player.clientid].push(collision.object.clientid);
				}
				return result || collision.normal.dot(0,1) < 0;
			},false);
		});

		state.state = stateUpdaters[oldstate.state.type](oldstate, oldstate.state, boxcollisions, playercollisions);
		if (state.state.type !== oldstate.state.type) {
			switch(state.state.type) {
				case 'postgame':
					state.state.scores.forEach(function(score) {
						var player = findPlayer(state,score.clientid);
						if (player) {
							player.score += score.score;
						}
					});
				break;
			}
		}

		return state;
	}

	return {
		init: initializeGame,
		update: updateGame
	};
});