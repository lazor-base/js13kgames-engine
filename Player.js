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
	// end variables

	// functions

	function register(mouse, keyboard, gamepad) {
		if(!players) {
			players = STRUCT_GET(STRUCT_MAKE(length + CONFIG_LENGTH, "s8"));
		}
		var player = players.get();
		player.set(LOCALID, uniqueId);
		player.set(REMOTEID, -1);
		player.set(PING, 30);
		player.set(MOUSE, mouse);
		player.set(KEYBOARD, keyboard);
		player.set(GAMEPAD, gamepad);
		uniqueId++;
		return player;
	}

	function find(type, id, callback) {
		var found = false;
		players.each(function(player) {
			if (player.get(type) === id) {
				found = true;
				callback(player);
			}
		});
		if (!found) {
			callback(PLAYER_REGISTER(-1, -1, id));
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
		event.emit("connect", player);
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
					event.emit("change", playerOne);
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
			event.emit("change", playerOne);
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

	function initPlayer() {
		playerOneCanUseController = unusedControllers();
		CONTROL_ON("connect", onGamePadConnect);
		CONTROL_ON("disconnect", onGamePadDisconnect);
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
		find: find,
		init: initPlayer,
		isLocal: isLocal,
		togglePlayer: togglePlayer,
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Player;
}