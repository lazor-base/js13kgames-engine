var Time = Module(function(event) {
	var now = Date.now;
	var serverTime = now();
	var timeDifference = 0;

	function nowTime() {
		return now() - timeDifference;
	}

	function parse(localTime, difference, serverReply) {
		return timeDifference = now() - localTime - difference;
	}
	var micro = (function() {
		var performance = window.performance;
		if (performance && performance.now) {
			return function() {
				return performance.now();
			};
		} else {
			var loadTime = now();
			return function() {
				return now() - loadTime;
			};
		}
	}())

	return {
		now: nowTime,
		parse: parse,
		micro: micro,
		set serverTime(time) {
			serverTime = time;
		}
	};
});