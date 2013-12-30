var Draw = Module(function(event) {
	// name: draw

	// variables
	var canvas, context;
	GUI_ON("ready", function() {
		canvas = GUI_MAKE("canvas");
		canvas.width = 900;
		canvas.height = 600;
		GUI_PUT(canvas);
		context = canvas.getContext("2d");
	});

	function poly(entity, context, fillColor, strokeColor) {
		with(context) {
			beginPath();
			var vertices = PHYSICS_GET_VERTICES(entity);
			moveTo(vertices.get(X), vertices.get(Y));
			for (i = 2; i < vertices.length; i += 2) {
				lineTo(vertices.get(i + X), vertices.get(i + Y));
			}
			lineTo(vertices.get(X), vertices.get(Y));
			LIST_PUT(vertices);
			// beginPath();
			// rect(-(entity.get(WIDTH) / 2), -(entity.get(HEIGHT) / 2), entity.get(WIDTH), entity.get(HEIGHT));
			fillStyle = fillColor;
			fill();
			lineWidth = 2;
			strokeStyle = strokeColor;
			stroke();
			closePath();
		}
	}

	function setupDraw(entity, context, callback) {
		var x = entity.get(X);
		var y = entity.get(Y);
		var angle = entity.get(ANGLE) || 0;
		with(context) {
			save();
			translate(x, y);
			rotate(angle * Math.PI / 180);
			callback(entity, context);
			restore();
		}
	}

	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	// end functions

	// other
	// end other

	return {
		// return
		clear: clear,
		poly: poly,
		setup: setupDraw
		// end return
	};
});