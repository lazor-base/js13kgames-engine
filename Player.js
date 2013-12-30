var Player = Module(function(event) {
	// name: player
	
	// variables
	var uniqueId = 0;
	var players = List.linked();

	var playerOneCanUseController = false;
	var totalControllers = 0;
	var playerOneUsingGamepad = false;
	var usedGamePads = [];
	// end variables

	// functions
	function register(mouse, keyboard, gamepad) {
		var player = List.get(6 + Config.length, "s8");
		player.set(LOCALID, uniqueId);
		player.set(REMOTEID, -1);
		player.set(PING, 30);
		player.set(MOUSE, mouse);
		player.set(KEYBOARD, keyboard);
		player.set(GAMEPAD, gamepad);
		uniqueId++;
		players.push(player);
		return player;
	}

	function find(type, id) {
		return players.each(function(player) {
			if (player.get(type) === id) {
				return player;
			}
		}) || false;
	}

	function onGamePadConnect(gamePadId) {
		console.log("gamepad connected")
		totalControllers++;
		playerOneCanUseController = unusedControllers();
	}

	function onGamePadDisconnect(gamePadId) {
		console.log("gamepad disconnected")
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
		return Help.has(usedGamePads, gamePadId);
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
			Help.itemRemove(usedGamePads, gamePadId); // remove the gamepad id from used gamepads
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
			for (var i = 0; i < Control.gamepads.length; i++) {
				var gamepad = Control.gamepads[i].index;
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
				Help.itemRemove(usedGamePads, playerOne.gamePadId); // remove the gamepad id from used gamepads
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
		Control.on("connect", onGamePadConnect);
		Control.on("disconnect", onGamePadDisconnect);
	}
	// end functions

	// other
	// end other

	return {
		// return
		length: 6,
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