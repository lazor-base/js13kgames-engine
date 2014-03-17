var State = Module(function() {
	"use strict";
	// name: State
	// targets: Client
	// filenames: Engine

	// variables
	var currentStates = [];
	var drawables = [];
	var updateables = [];
	var gameStates = {};
	// end variables

	// functions

	// function Focus(gameState) {}

	function Pop() {
		var state = currentStates[currentStates.length - 1];
		state.Leaving();
		currentStates.pop();
		if (state._obscured === true) {
			rebuildUpdateableAndDrawableQueues();
		} else {
			removeFromDrawablesOrUpdateables(state);
		}
		notifyRevealedStates();
		return state;
	}

	function Push(gameState) {
		currentStates.push(gameState);
		addToDrawablesOrUpdateables(gameState);
		notifyObscuredStates();
		gameState.Entered();
	}

	function Peek() {
		return currentStates[0];
	}

	function notifyObscuredStates() {
		if (currentStates.length) {
			var index = currentStates.length - 2;
			while (index > 0) {
				if (currentStates[index]._obscured === true) {
					break;
				}--index;
			}
			while (index < currentStates.length - 1) {
				currentStates[index].Obscuring();
				currentStates[index]._obscured = true;
				++index;
			}
		}
	}

	function notifyRevealedStates() {
		if (currentStates.length) {
			var index = currentStates.length - 1;
			while (index > 0) {
				if (currentStates[index]._obscured === true) {
					break;
				}--index;
			}
			while (index < currentStates.length) {
				currentStates[index]._obscured = false;
				currentStates[index].Revealed();
				++index;
			}
		}
	}

	function newGameState(Id, Entered, Leaving, Obscuring, Revealed, Update, Draw) {
		var gameState = {
			Id: Id,
			_obscured: false,
			Entered: Entered,
			Leaving: Leaving,
			Obscuring: Obscuring,
			Revealed: Revealed,
			Update: Update,
			Draw: Draw
		};
		gameStates[Id] = gameState;
		return gameState;
	}

	function Update(deltaTime) {
		for (var i = 0; i < updateables.length; i++) {
			updateables.Update(deltaTime);
		}
	}

	function Draw(deltaTime) {
		for (var i = 0; i < drawables.length; i++) {
			drawables.Draw(deltaTime);
		}
	}

	function addToDrawablesOrUpdateables(gameState) {
		if (typeof gameState.Draw === "function") {
			drawables.push(gameState);
		}
		if (typeof gameState.Update === "function") {
			updateables.push(gameState);
		}
	}

	function removeFromDrawablesOrUpdateables(gameState) {
		if (typeof gameState.Draw === "function") {
			drawables.pop();
		}
		if (typeof gameState.Update === "function") {
			updateables.pop();
		}
	}

	function rebuildUpdateableAndDrawableQueues() {
		drawables.length = 0;
		updateables.length = 0;
		if (currentStates.length) {
			var index = currentStates.length - 1;
			while (index > 0) {
				if (currentStates[index]._obscured === true) {
					break;
				}--index;
			}
			while (index < currentStates.length) {
				addToDrawablesOrUpdateables(currentStates[index]);
				++index;
			}
		}
	}
	// end functions

	// other
	LOOP_EVERY("frame", function(deltaTime) {
		Update(deltaTime);
		Draw(deltaTime);
	});
	// end other

	return {
		// return
		pop:Pop,
		push:Push,
		peek:Peek,
		// focus:Focus,
		newState:newGameState
		// end return
	};
});

if (typeof module !== "undefined") {
	module.exports = State;
}