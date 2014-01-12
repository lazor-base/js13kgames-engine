var Time = Module(function(event) {

	var now = Date.now;
	var serverTime = now();

	function nowTime() {
		return now();
	}

	var micro = (function() {
		var getNanoSeconds, hrtime, loadTime;
		var performance = window.performance;
		var process = process;
		if (performance && performance.now) {
			return function() {
				return performance.now();
			};
		} else if (process && process.hrtime) {
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
		} else {
			loadTime = now();
			return function() {
				return now() - loadTime;
			};
		}
	}())


	return {
		now: nowTime,
		micro: micro
	};
});
if (typeof module !== "undefined") {
	module.exports = Time;
}