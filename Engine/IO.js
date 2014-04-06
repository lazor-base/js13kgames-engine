Module(function() {
	"use strict";
	// name: IO
	// targets: Client
	// filenames: Engine
	// variables
	var fs = require("fs");
	// end variables
	// functions

	function writeFile(fileData, location) {
		fs.writeFile(location, fileData, function(err) {
			if (err) {
				throw err;
			}
		});
	}

	function readFile(location, callback) {
		if(callback) {
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