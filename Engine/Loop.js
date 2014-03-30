var Loop = Module(function(event) {
	"use strict";
	// name: Loop
	// target: Client
	// filenames: Engine

	// variables
	var stop = true;
	var currentTick = 0;
	var lastTick = 0;
	var loop;
	var timeEstimates = [];
	var queuedFunctions = [];
	var queuedParameters = [];
	var queueLength = 0;
	// end variables

	// functions

	function queue(timeEstimate, functiontoQueue, parameters) {
		timeEstimates.push(timeEstimate);
		queuedFunctions.push(functiontoQueue);
		queuedParameters.push(parameters);
		queueLength++;
	}

	function nextFrame(callback) {
		if (typeof window.requestAnimationFrame === "function") {
			return window.requestAnimationFrame(callback);
		} else {
			return setTimeout(callback, 1000 / 60);
		}
	}

	function go(bool) {
		stop = !bool;
		if (bool) {
			loop = nextFrame(run);
		}
	}

	function run() {
		if (stop === false) {
			lastTick = currentTick;
			currentTick = TIME_MICRO();
			event.emit("nextFrame", currentTick - lastTick);
				if (stop) {
					return true;
				}
				event.emit("frame", currentTick - lastTick);

			loop = nextFrame(run);
		}
	}
	// end functions

	// other
	event.on("nextFrame", function(timeDelta) {
		var timeOccupied = 0;
		var done = false;
		while (queueLength > 0 && done === false) {
			if (timeEstimates[timeEstimates.length - 1] + timeOccupied < 10) {
				queueLength--;
				var params = queuedParameters.pop();
				params.push(timeDelta);
				var fn = queuedFunctions.pop();
				timeOccupied += timeEstimates.pop();
				fn.apply(null, params);
			} else {
				done = true;
			}
		}
	});
	// end other

	return {
		// return
		go: go,
		queue: queue,
		every: event.on,
		remove: event.off,
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Loop;
}