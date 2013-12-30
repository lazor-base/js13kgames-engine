var GUI = (function(window, document) {
	// name: gui
	return Module(function(event) {
		// variables
		var isReady = false;
		// end variables

		// functions
		var test = function() {
			if (!isReady) {
				isReady = document.readyState === "complete";
				setTimeout(test, 10);
			} else {
				event.emit("ready");
			}
		};
		setTimeout(test, 10);

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

		function template(template, vars) {
			var result = template;
			for (var attr in vars) {
				result = result.replace(new RegExp("{{" + attr + "}}", 'g'), vars[attr]);
			}
			return result;
		}
		// end functions

		// other
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
}(window, document));