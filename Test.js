var Test = Module(function(event) {
	// name: Game
	// targets: Test
	// filenames: Game
	// variables
	// end variables
	// functions

	function start() {
		module( "List int4 support" );
		test("Set int4 index 0", function() {
			var int4 = LIST_GET(5,"u4");
			int4.set(0,12);
			equal(int4.get(0), 12, "Passed!");
		});

		test("Set int4 index 1", function() {
			var int4 = LIST_GET(5,"u4");
			int4.set(1,12);
			equal(int4.get(1), 12, "Passed!");
		});
		test("Set int4 Negative", function() {
			var int4 = LIST_GET(5,"u4");
			int4.set(1,-12);
			equal(int4.get(1, "-"), -12, "Passed!");
		});

		module( "List int12 support" );
		test("Set int12 index 0", function() {
			var int12 = LIST_GET(5,"u12");
			int12.set(0,12);
			equal(int12.get(0), 12, "Passed!");
		});

		test("Set int12 index 1", function() {
			var int12 = LIST_GET(5,"u12");
			int12.set(1,12);
			equal(int12.get(1), 12, "Passed!");
		});
		test("Set int12 Negative", function() {
			var int12 = LIST_GET(5,"u12");
			int12.set(1,12);
			equal(int12.get(1, "-"), -12, "Passed!");
		});
	}

	function setup() {

	}
	// end functions
	// other
	// end other

	return {
		// return
		setup: setup,
		start: start
		// end return
	};
});