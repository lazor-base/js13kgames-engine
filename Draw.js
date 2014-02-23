var Draw = Module(function(event) {
	// name: Draw
	// targets: Client
	// filenames: Engine

	// variables
	var stage, renderer;
	var graphics = [];
	var sprites = [];
	var textures = [];
	// end variables


	// functions

	function newGraphic(callback) {
		var index = graphics.length;
		var graphic = new PIXI.Graphics();
		graphics.push(graphic);
		stage.addChild(graphic);
		callback(graphic);
		return index;
	}

	function getGraphic(index) {
		return graphics[index];
	}

	function makeSprite(index, callback) {
		var sprite = new PIXI.Sprite(textures[index]);
		callback(sprite);
		stage.addChild(sprite);
	}

	function registerTexture(texture) {
		var index = textures.length;
		textures.push(texture);
		return index;
	}

	function getTexture(index) {
		return textures[index];
	}

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

	function changeState(context, property, value) {
		if (context[property] !== value) {
			context[property] = value;
		}
	}

	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	// end functions

	// other
	GUI_ON("ready", function() {
		stage = new PIXI.Stage();
		renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, null, true);
		// amount = (renderer instanceof PIXI.WebGLRenderer) ? 50 : 5;
		// if (amount == 5) {
		// 	renderer.context.mozImageSmoothingEnabled = false;
		// 	renderer.context.webkitImageSmoothingEnabled = false;
		// }
		GUI_PUT(renderer.view);
		LOOP_EVERY(0, function(deltaTime) {
			renderer.render(stage);
		});
	});
	// end other

	return {
		// return
		clear: clear,
		newGraphic: newGraphic,
		getGraphic: getGraphic,
		change: changeState,
		poly: poly,
		registerTexture: registerTexture,
		getTexture: getTexture,
		makeSprite: makeSprite,
		setup: setupDraw,
		move: reposition,
		get stage() {
			return stage
		}
		// end return
	};
});