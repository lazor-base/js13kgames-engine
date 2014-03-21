var State = Module(function() {
	"use strict";
	// name: State
	// targets: Client
	// filenames: Engine

	// variables
	var gameStates = {};
	var historyStack = [];
	var enabledStates = {};
	// end variables

	// functions

	function deactivateState(gameState) {
		if (enabledStates[gameState.Id] === 0) {
			return false;
		}
		if (historyStack[historyStack.length - 1] === gameState.Id) {
			historyStack.pop();
		}
		gameState.Exiting();
		enabledStates[gameState.Id] = 0;
		notifyStates(gameState, false);
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
		if (historyStack[historyStack.length - 1] !== gameState.Id) {
			historyStack.push(gameState.Id);
		}
		enabledStates[gameState.Id] = 1;
		notifyStates(gameState, true);
		gameState.Entered();
	}

	function previousState() {
		deactivateState(gameStates[historyStack[historyStack.length - 1]]);
		activateState(gameStates[historyStack[historyStack.length - 1]]);
	}

	function notifyStates(gameState, hide) {
		var depth = gameState.DepthIndex;
		var id = 0;
		for (id in enabledStates) {
			if (id !== gameState.Id) {
				if (gameStates[id]._obscured === false) {
					if (hide && gameStates[id].DepthIndex < depth) {
						gameStates[id].Obscuring();
						gameStates[id]._obscured = true;
					}
				}
			}
		}
			var lastDepth = 0;
		for (var i = historyStack.length - 1; i > -1; i--) {
			id = historyStack[i];
			if (enabledStates[id] === 1 && gameStates[id]._obscured === true && !hide && gameStates[id].DepthIndex >= lastDepth) {
				gameStates[id]._obscured = false;
				gameStates[id].Revealed();
				lastDepth = gameStates[id].DepthIndex;
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
		previous: previousState
		// end return
	};
});

if (typeof module !== "undefined") {
	module.exports = State;
}