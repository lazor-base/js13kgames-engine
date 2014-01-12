var GUI = (function(document) {
	// name: GUI
	// target: Client
	// filenames: Engine
	return Module(function(event) {
		// variables
		var isReady = false;
		// end variables

		// functions
		function getGUI(id) {
			return document.getElementById(id);
		}

		function putGUI(node, parent) {
			if (!parent) {
				parent = document.body;
			}
			return parent.appendChild(node);
		}

		function makeGUI(name) {
			return document.createElement(name);
		}

		function setGUI(element, nameValueList, value) {
			if (value) {
				element.setAttribute(nameValueList, value);
			} else {
				for (var i = 0; i < nameValueList.length; i += 2) {
					element.setAttribute(nameValueList[i], nameValueList[i + 1]);
				}
			}
		}

		function removeGUI(node) {
			node.parentNode.removeChild(node);
		}

		function template(templateString, vars) {
			var result = templateString;
			for (var attr in vars) {
				result = result.replace(new RegExp("{{" + attr + "}}", 'g'), vars[attr]);
			}
			return result;
		}
		// end functions

		// other
		var testReadyState = function() {
			if (!isReady) {
				isReady = document.readyState === "complete";
				setTimeout(testReadyState, 10);
			} else {
				event.emit("ready");
			}
		};
		setTimeout(testReadyState, 10);
		// end other

		return {
			// return
			template: template,
			remove: removeGUI,
			put: putGUI,
			get: getGUI,
			make: makeGUI,
			set: setGUI,
			on: event.on,
			emit: event.emit
			// endreturn
		};
	});
}(document));