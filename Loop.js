var Loop = Module(function(event) {
	var stop = true;
	var currentTick = 0;
	var lastTick = 0;
	var intervals = [];
	var intervalTicks = [];
	var loop;
	function nextFrame(callback) {
		if (typeof requestAnimationFrame === "function") {
			return requestAnimationFrame(callback);
		} else {
			return setTimeout(callback, 1000 / 60);
		}
	};

	function go(bool) {
		stop = !bool;
		if (bool) {
			loop = nextFrame(run);
		}
	}

	function run() {
		if (stop === false) {
			lastTick = currentTick;
			currentTick = Time.micro();
			for (var i = 0; i < intervals.length; i++) {
				if (stop) {
					return true;
				}
				var interval = parseInt(intervals[i], 10);
				if (currentTick - intervalTicks[i] >= interval) {
					var deltaTime = currentTick - intervalTicks[i];
					intervalTicks[i] = currentTick;
					event.emit(intervals[i], deltaTime);
				}
			}
			loop = nextFrame(run);
		}
	}

	function every(interval, callback) {
		if (intervals.indexOf("" + interval) === -1) {
			intervals.push("" + interval);
			intervalTicks.push(Time.micro());
		}
		event.on("" + interval, callback);
	}
	return {
		go: go,
		every: every,
		on: event.on,
		emit: event.emit,
	};
});
if (typeof module !== "undefined") {
	module.exports = Loop;
}