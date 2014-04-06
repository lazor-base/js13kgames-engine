Module(function() {
	"use strict";
	// name: IO
	// targets: Client
	// filenames: Engine
	// variables
	// end variables
	// functions

	function writeFile(fileData, location) {
		var fs = require("fs");
		fs.writeFile(location, fileData, function(err) {
			if (err) {
				throw err;
			}
		});
	}

	function readFile(location, callback) {
		var fs = require("fs");
		if (callback) {
			console.trace();
			throw "NO CALLBACK";
		}
		return fs.readFileSync(location, "utf8");
	}

	// end functions
	// other

	// end other
	return {
		// return
		read: readFile,
		write: writeFile
		// end return
	};
});