Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	// end variables
	// functions
	function systems() {
		SYSTEM_DEFINE_SYSTEM(S_SHAPE, false, new Uint16Array(STRUCTURE_ENTRIES), S_TYPED_ARRAY, function(width, height, depth) {
			return new Uint16Array([width, height, depth]);
		}, function(data) {
			return new Uint16Array(data);
		});
		SYSTEM_DEFINE_SYSTEM(S_POSITION, true, new Int32Array(POSITION_ENTRIES), S_TYPED_ARRAY, function(x, y, z) {
			return new Int32Array([x, y, z]);
		}, function(data) {
			return new Int32Array(data);
		});
		SYSTEM_DEFINE_SYSTEM(S_DESCRIPTION, false, "description", S_STRING, function(description) {
			return description;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_COLOR, false, ["#000000", 0xFF0000], S_ARRAY, function(hexidecimal, decimal) {
			return [hexidecimal, decimal];
		}, function(data) {
			return [data[0], data[1]];
		});
		SYSTEM_DEFINE_SYSTEM(S_ID, false, 0, S_NUMBER, function(number) {
			return number;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_DRAW, false, function() {}, S_FUNCTION, function(fn) {
			return fn;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_SYMBOL, false, "description", S_STRING, function(description) {
			return description;
		}, function(data) {
			return data;
		});
		SYSTEM_READY();
	}
	// end functions
	// other
	// end other

	return {
		// return
		systems: systems
		// end return
	};
});
