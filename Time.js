var Time = Module(function(event) {
	// name: time

	// variables
	var serverTime = Date.now();
	var lastServerTimeSync = window.performance.now();
	var timeDifference = 0;
	// end variables

	// functions
	function now() {
		return Date.now() - timeDifference;
	}

	function parse(localTime, difference, serverReply, callback) {
		var roundTripTime = Date.now() - localTime;
		var responseTime = roundTripTime - difference;
		timeDifference = responseTime;
		if (typeof callback === "function") {
			callback();
		}
	}
	var micro = (function() {
		var getNanoSeconds, hrtime, loadTime;

		if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
			return function() {
				return performance.now();
			};
		} else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
			hrtime = process.hrtime;
			getNanoSeconds = function() {
				var hr;
				hr = hrtime();
				return hr[0] * 1e9 + hr[1];
			};
			loadTime = getNanoSeconds();
			return function() {
				return (getNanoSeconds() - loadTime) / 1e6;
			};
		} else if (Date.now) {
			loadTime = Date.now();
			return function() {
				return Date.now() - loadTime;
			};
		} else {
			loadTime = new Date().getTime();
			return function() {
				return new Date().getTime() - loadTime;
			};
		}
	}())
	// end functions

	// other
	// end other

	return {
		// return
		now: now,
		parse: parse,
		micro: micro,
		set serverTime(time) {
			lastServerTimeSync = window.performance.now();
			serverTime = time;
		}
		// end return
	};
});