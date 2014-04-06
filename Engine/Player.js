var Player = Module(function(event) {
	// name: Player
	// target: Client
	// filenames: Engine

	// variables
	var uniqueId = 0;
	var players;

	var playerOneCanUseController = false;
	var totalControllers = 0;
	var playerOneUsingGamepad = false;
	var usedGamePads = [];
	var length = 6;
	var maxPlayers = 0;
	var activePlayers;
	// end variables

	// functions

	// function register(mouse, keyboard, gamepad) {
	// 	if (!players) {
	// 		players = STRUCT_GET(STRUCT_MAKE(length + CONFIG_LENGTH, INT8));
	// 	}
	// 	var player = players.get();
	// 	player.set(LOCALID, uniqueId);
	// 	player.set(REMOTEID, -1);
	// 	player.set(PING, 30);
	// 	player.set(MOUSE, mouse);
	// 	player.set(KEYBOARD, keyboard);
	// 	player.set(GAMEPAD, gamepad);
	// 	uniqueId++;
	// 	return player;
	// }

	function find(type, id, callback) {
		var found = false;
		if (type === MOUSE && players.first.get(type) === id) {
			return callback(players.first);
		}
		players.each(function(player) {
			if (player.get(type) === id) {
				found = true;
				return callback(player);
			}
		});
		if (!found) {
			return callback(PLAYER_REGISTER(-1, -1, id));
		}
	}

	function onGamePadConnect() {
		console.log("gamepad connected");
		totalControllers++;
		playerOneCanUseController = unusedControllers();
	}

	function onGamePadDisconnect(gamePadId) {
		console.log("gamepad disconnected");
		totalControllers--;
		if (gamePadInUse(gamePadId)) {
			// gamepad in use, disconnect that user.
			disconnectPlayer(gamePadId);
		}
		playerOneCanUseController = unusedControllers();
	}

	function gamePadInUse(gamePadId) {
		if (gamePadId === -1) {
			return true;
		}
		return HELP_HAS(usedGamePads, gamePadId);
	}

	function disconnectPlayer(gamePadId) {
		var player = find(GAMEPAD, gamePadId);
		if (player.same(LOCALID, 0)) {
			playerOneSwapInput();
			return false;
		}
		emit("disconnect", player);
		player.remove();
		if (gamePadInUse(gamePadId)) {
			HELP_ITEM_REMOVE(usedGamePads, gamePadId); // remove the gamepad id from used gamepads
		}
	}

	function connectPlayer(gamePadId) {
		var player = register(-1, -1, gamePadId);
		if (!gamePadInUse(gamePadId)) {
			usedGamePads.push(gamePadId); // reserve this gamepad as used.
		}
		EMIT_EVENT("connect", player);
	}

	function playerOneSwapInput() {
		var playerOne = find(KEYBOARD, 0);
		if (playerOne.same(GAMEPAD, -1)) {
			// if player one isnt using a gamepad yet, lets find him one.
			for (var i = 0; i < CONTROL_GAMEPADS.length; i++) {
				var gamepad = CONTROL_GAMEPADS[i].index;
				if (!gamePadInUse(gamepad)) {
					playerOne.set(GAMEPAD, gamepad);
					usedGamePads.push(gamepad); // reserve this gamepad as used.
					playerOneUsingGamepad = true;
					EMIT_EVENT("change", playerOne);
					return true;
				}
			}
		} else {
			// reset back to keyboard
			if (gamePadInUse(playerOne.get(GAMEPAD))) {
				HELP_ITEM_REMOVE(usedGamePads, playerOne.gamePadId); // remove the gamepad id from used gamepads
			}
			playerOne.set(GAMEPAD, -1);
			playerOneUsingGamepad = false;
			EMIT_EVENT("change", playerOne);
			return true;
		}
	}

	function togglePlayer(gamePadId) {
		//player pressed start button on controller
		var player = find(GAMEPAD, gamePadId);
		if (player !== false) {
			// this player is already connected, disconnect them
			disconnectPlayer(gamePadId);
		}
		if (player === false) {
			// no players are using this gamepad, add a new player
			connectPlayer(gamePadId);
		}
		playerOneCanUseController = unusedControllers();
	}

	function isLocal(remoteId) {
		if (find(REMOTEID, remoteId)) {
			return true;
		}
		return false;
	}

	function unusedControllers() {
		if (Control.gamepads.length > 0 && Control.gamepads.length > usedGamePads.length) {
			return true;
		}
		return false;
	}

	var walk = function(dir, done) {
		"use strict";
		var results = [];
		fs.readdir(dir, function(err, list) {
			if (err) {
				return done(err);
			}
			var pending = list.length;
			if (!pending) {
				return done(null, results);
			}
			list.forEach(function(file) {
				file = dir + "/" + file;
				fs.stat(file, function(err, stat) {
					if (stat && stat.isDirectory()) {
						walk(file, function(err, res) {
							results = results.concat(res);
							if (!--pending) {
								done(null, results);
							}
						});
					} else {
						if (isGoodFile(file)) {
							results.push(file);
						}
						if (!--pending) {
							done(null, results);
						}
					}
				});
			});
		});
	};

	function initPlayer() {
		var fs = require("fs");
		var path = require("path");
		playerOneCanUseController = unusedControllers();
		CONTROL_ON("connect", onGamePadConnect);
		CONTROL_ON("disconnect", onGamePadDisconnect);
		players = [];
		fs.exists("User/", function(exists) {
			if (!exists) {
				fs.mkdir("User");
			} else {
				walk("User", function(results) {
					for (var i = 0; i < results.length; i++) {
						if (results[i] === "player.json") {
							IO_READ(results[i], function(fileData) {
								register(fileData[PLAYER_NAME], fileData[PLAYER_ID], fileData[PLAYER_KEYS], fileData[PLAYER_OPTIONS]);
							});
						}
					}
				});
			}
		});
	}

	function setMaxPlayers(playerNumber) {
		maxPlayers = playerNumber;
		activePlayers = new Uint8Array(playerNumber);
	}

	function register(username, id, keymap, settings) {
		if (username && id && keymap && settings) {
			players[id] = [id, username, keymap, settings];
		} else {
			var newOptions = JSON.parse(JSON.stringify(OPTIONS_DEFAULTS));
			var newKeyMap = JSON.parse(JSON.stringify(CONFIG_DEFAULTS));
			players[id] = [uniqueId, username, newKeyMap, newOptions];
			IO_WRITE(JSON.stringify(players[id]), "User/" + uniqueId + "/player.json");
			uniqueId++;
		}
	}

	function login(playerId) {

	}

	function eachPlayer(fn) {
		for(var i=0;i<players.length;i++) {
			fn(players[i]);
		}
	}

	// end functions

	// other
	// end other

	return {
		// return
		get length() {
			return length;
		},
		register: register,
		each: eachPlayer,
		find: find,
		init: initPlayer,
		isLocal: isLocal,
		togglePlayer: togglePlayer,
		max: setMaxPlayers
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Player;
}