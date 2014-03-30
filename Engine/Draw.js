Module(function(event) {
	"use strict";
	// name: Draw
	// targets: Client
	// filenames: Engine

	// variables
	var stage, renderer;
	// end variables


	// functions

	function poly(entity, graphic) {

		// context.beginPath();
		// var vertices = PHYSICS_GET_VERTICES(entity);
		// moveTo(vertices.get(X), vertices.get(Y));
		// for (i = 2; i < vertices.length; i += 2) {
		// context.lineTo(vertices.get(i + X), vertices.get(i + Y));
		// }
		// context.lineTo(vertices.get(X), vertices.get(Y));
		// LIST_PUT(vertices);
		// context.beginPath();
		graphic.clear();
		graphic.beginFill(entity.get(COLOR), 1);
		graphic.drawRect(-(entity.get(WIDTH) / 2), -(entity.get(HEIGHT) / 2), entity.get(WIDTH), entity.get(HEIGHT));
		graphic.endFill();
		// changeState(context, "lineWidth",2);
		// changeState(context, "strokeStyle",strokeColor);
		// context.fill();
		// context.stroke();
		// context.closePath();
	}

	function setupDraw(entity, graphic, callback) {
		var x = entity.get(X);
		var y = entity.get(Y);
		var angle = entity.get(ANGLE) || 0;
		// context.save();
		graphic.position.x = x;
		graphic.position.y = y;
		graphic.rotation = angle * Math.PI / 180;
		// context.translate(x, y);
		// context.rotate(angle * Math.PI / 180);
		callback(entity, graphic);
		// context.restore();
	}

	function reposition(graphic, entity) {
		graphic.position.x = entity.get(X);
		graphic.position.y = entity.get(Y);
		graphic.rotation = entity.get(ANGLE) * Math.PI / 180;
	}

	function drawStage() {
		renderer.render(stage);
	}
	// end functions

	// other
	GUI_ON("UIReady", function() {
		stage = new PIXI.Stage();
		renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, null, true);
		// amount = (renderer instanceof PIXI.WebGLRenderer) ? 50 : 5;
		// if (amount == 5) {
		// 	renderer.context.mozImageSmoothingEnabled = false;
		// 	renderer.context.webkitImageSmoothingEnabled = false;
		// }

		EMIT_EVENT("RenderReady");
	});
	GUI_ON("resize", function() {
		renderer.resize(window.innerWidth, window.innerHeight);
	});
	// end other

	return {
		// return
		poly: poly,
		setup: setupDraw,
		move: reposition,
		render:drawStage,
		get stage() {
			return stage;
		},
		get renderer() {
			return renderer;
		},
		off: event.off,
		on:event.on
		// end return
	};
});