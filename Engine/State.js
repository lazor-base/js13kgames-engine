Module(function() {
	"use strict";
	// name: State
	// targets: Client
	// filenames: Engine

	// variables
	var gameStates = {};
	var historyStack = [];
	var enabledStates = {};
	var numberOfStates = 0;
	var historyIndex = -1;
	var rewind = false;
	// end variables

	// functions

	function deactivateState(gameState) {
		if (enabledStates[gameState.Id] === 0) {
			return false;
		}
		gameState.Exiting();
		enabledStates[gameState.Id] = 0;
		notifyStates(gameState);
		if (gameState.FullScreen && !rewind) {
			historyIndex--;
			// console.log("reverse history", historyIndex)
		}
	}

	function toggleState(gameState) {
		if (enabledStates[gameState.Id] === 1) {
			deactivateState(gameState);
		} else {
			activateState(gameState);
		}
	}

	function activateState(gameState) {
		if (enabledStates[gameState.Id] === 1) {
			return false;
		}
		enabledStates[gameState.Id] = 1;
		notifyStates(gameState);
		gameState.Entered();
		if (gameState.FullScreen && !rewind) {
			historyIndex++;
			if (!historyStack[historyIndex]) {
				historyStack[historyIndex] = new Uint8Array(numberOfStates);
			}
			for (var id in enabledStates) {
				historyStack[historyIndex][id] = enabledStates[id];
			}
				// console.log("new history", historyStack[historyIndex], historyIndex)
		}
	}

	function previousState() {
		historyIndex--;
		if (historyIndex < 0) {
			historyIndex = -1;
			return false;
		}
		var length = historyStack[historyIndex].length;
		for (var i = 0; i < length; i++) {
			var historyState = historyStack[historyIndex][i];
			var currentState = enabledStates[i];
			if (historyState !== currentState) {
				rewind = true;
				toggleState(gameStates[i]);
				rewind = false;
			}
		}
	}

	function notifyStates(gameState) {
		if (gameState.FullScreen) {
			var id = 0;
			var lastDepth = 0;
			for (id in enabledStates) {
				if (enabledStates[id] && gameStates[id].DepthIndex >= lastDepth/* && gameStates[id].FullScreen*/) {
					lastDepth = gameStates[id].DepthIndex;
				}
			}
			for (id in enabledStates) {
				if (enabledStates[id] && gameStates[id].DepthIndex < lastDepth && gameStates[id]._obscured === false) {
					gameStates[id].Obscuring();
					gameStates[id]._obscured = true;
				}
			}

			for (id in enabledStates) {
				if (enabledStates[id] && gameStates[id].DepthIndex >= lastDepth && gameStates[id]._obscured === true) {
					gameStates[id]._obscured = false;
					gameStates[id].Revealed();
				}
			}
		}
	}

	function newGameState(Id, DepthIndex, FullScreen, Entered, Exiting, Obscuring, Revealed, Update, Draw) {
		var gameState = {
			Id: Id,
			DepthIndex: DepthIndex,
			FullScreen: FullScreen,
			_obscured: false,
			Entered: Entered,
			Exiting: Exiting,
			Obscuring: Obscuring,
			Revealed: Revealed,
			Update: Update,
			Draw: Draw
		};
		if (!gameStates[Id]) {
			numberOfStates++;
		}
		gameStates[Id] = gameState;
		return gameState;
	}

	function UpdateAndDraw(deltaTime) {
		for (var id in enabledStates) {
			if (enabledStates[id] === 1 && gameStates[id]._obscured === false) {
				if (typeof gameStates[id].Update === "function") {
					gameStates[id].Update(deltaTime);
				}
				if (typeof gameStates[id].Draw === "function") {
					gameStates[id].Draw(deltaTime);
				}
			}
		}
	}

	function checkState(stateId, active) {
		if(enabledStates[stateId] === active) {
			return true;
		}
		return false;
	}
	// end functions

	// other
	LOOP_EVERY("frame", function(deltaTime) {
		UpdateAndDraw(deltaTime);
	});
	// end other

	return {
		// return
		deactivate: deactivateState,
		toggle: toggleState,
		activate: activateState,
		newState: newGameState,
		previous: previousState,
		check: checkState
		// end return
	};
});