var Loop = Module(function(event) {
	// name: Loop
	// target: Client
	// filenames: Engine

	// variables
	var stop = true;
	var currentTick = 0;
	var lastTick = 0;
	var intervals = [];
	var intervalTicks = [];
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
		if (typeof requestAnimationFrame === "function") {
			return requestAnimationFrame(callback);
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
			EMIT_EVENT("nextFrame", currentTick - lastTick);
			for (var i = 0; i < intervals.length; i++) {
				if (stop) {
					return true;
				}
				var interval = parseInt(intervals[i], 10);
				if (currentTick - intervalTicks[i] >= interval) {
					var deltaTime = currentTick - intervalTicks[i];
					intervalTicks[i] = currentTick;
					EMIT_EVENT(intervals[i], deltaTime);
				}
			}
			loop = nextFrame(run);
		}
	}

	function every(interval, callback) {
		var intervalString = "" + interval;
		if (intervals.indexOf(intervalString) === -1) {
			intervals.push(intervalString);
			intervalTicks.push(TIME_MICRO());
		}
		event.on(intervalString, callback);
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
		every: every,
		on: event.on,
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Loop;
}