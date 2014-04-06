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
		fs.writeFileSync(location, fileData);
	}

	function readFile(location, callback) {
		var fs = require("fs");
		if (callback) {
			console.trace();
			throw "NO CALLBACK";
		}
		return JSON.parse(fs.readFileSync(location, "utf8"));
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