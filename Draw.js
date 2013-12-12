var Draw = Module(function(event) {
	// name: draw

	// variables
	var canvas, context;
	// end variables

	// functions
	GUI.on("ready", function() {
		canvas = GUI.make("canvas");
		canvas.width = 900;
		canvas.height = 600;
		GUI.put(canvas);
		context = canvas.getContext("2d");
	});

	function poly(entity, context, fillColor, strokeColor) {
		context.beginPath();
		var vertices = physics.getVertices(entity);
		context.moveTo(vertices.get(X), vertices.get(Y));
		for (i = 2; i < vertices.length; i += 2) {
			context.lineTo(vertices.get(i + X), vertices.get(i + Y));
		}
		context.lineTo(vertices.get(X), vertices.get(Y));
		List.put(vertices);
		// context.beginPath();
		// context.rect(-(entity.get(WIDTH) / 2), -(entity.get(HEIGHT) / 2), entity.get(WIDTH), entity.get(HEIGHT));
		context.fillStyle = fillColor;
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = strokeColor;
		context.stroke();
		context.closePath();
	}

	function setupDraw(entity, context, callback) {
		var x = entity.get(X);
		var y = entity.get(Y);
		var angle = entity.get(ANGLE) || 0;
		context.save();
		context.translate(x, y);
		context.rotate(angle * Math.PI / 180);
		callback(entity, context);
		context.restore();
	}

	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	// end functions

	// other
	// end other

	return {
<<<<<<< HEAD
		// return
=======
		get canvas() {
			return canvas;
		},
>>>>>>> Working lighting implementation
		clear: clear,
		poly: poly,
		setup: setupDraw
		// end return
	};
});