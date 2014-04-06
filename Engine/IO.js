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
		fs.readFile(location, "utf8", function(err, data) {
			if (err) {
				throw err;
			}
			callback(data);
		});
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