var Game = Module(function() {
	// name_: Game
	// targets: Client
	// filenames: Game
	// variables
	var _canvas, _ctx,
	_width, _height,

	light0,
	viewport0,
	viewport1,

	_mouseX = 0,
		_mouseY = 0;
		// end variables
		// functions

	function createLights() {

		viewport0 = LIGHT_VIEW(400, 400, PROJECTION);
		// viewport0 = LIGHT_VIEW(400, 400, TRIANGLE, 100, _width / 1.5);
		// viewport1 = LIGHT_VIEW(400, 400, CIRCLE, viewport0.get(WIDTH) / 2);
		viewport1 = LIGHT_VIEW(400, 400, CIRCLE, 0);
		light0 = LIGHT_SOURCE(400, 400, 226, 254, 77, 200);
		// LIGHT_SOURCE(50, 200, 103, 255, 179, 200);
		LIGHT_SOURCE(620, 500, 255, 56, 209);
		LIGHT_SOURCE(0, 0, 68, 192, 209, 200);
	}

	function createScreenObjects() {
		LIGHT_WALL(100, 350, 25, 600);
		var boxA = LIGHT_WALL(400, 300, 200, 50);
		boxA.set(ANGLE, 10);
		var boxB = LIGHT_WALL(200, 100, 50, 50);
		boxB.set(ANGLE, 45);
		LIGHT_WALL(300, 100, 50, 50);
		LIGHT_WALL(400, 100, 50, 50);
		LIGHT_WALL(500, 100, 50, 50);
		LIGHT_WALL(200, 200, 50, 50);
		LIGHT_WALL(200, 300, 50, 50);
		LIGHT_WALL(200, 400, 50, 50);
		var boxC = LIGHT_WALL(200, 500, 50, 50);
		boxC.set(ANGLE, 80);
		LIGHT_WALL(300, 500, 50, 50);
		LIGHT_WALL(400, 500, 50, 50);
		LIGHT_WALL(500, 500, 50, 50);
	}

	function controlInner(localId, action, value) {
		if (action === LIGHTING_X) {
			_mouseX = value - _canvas.offsetLeft;
		}
		if (action === LIGHTING_Y) {
			_mouseY = value - _canvas.offsetTop;
		}
		if (action === MOVEUP) {
			viewport0.set(VELOCITY_Y, value);
			viewport1.set(VELOCITY_Y, value);
		}
		if (action === TURNCW) {
			viewport0.set(VELOCITY_X, value);
			viewport1.set(VELOCITY_X, value);
		}
		if (action === TURNCCW) {
			viewport0.set(VELOCITY_X, -value);
			viewport1.set(VELOCITY_X, -value);
		}
		if (action === MOVEDOWN) {
			viewport0.set(VELOCITY_Y, -value);
			viewport1.set(VELOCITY_Y, -value);
		}
		if (action === TURNCW) {
			// test1.set(TURNSPEED, value);
		}
		if (action === TURNCCW) {
			// test1.set(TURNSPEED, -value);
		}
		if (action === CHANGE_TO_PROJECTION) {
			viewport0.set(VIEWPORT_TYPE, PROJECTION);
			viewport0.set(RANGE, Math.sqrt((_width * _width) + (_height * _height)));
			viewport1.set(RANGE, 0);
		}
		if (action === CHANGE_TO_CIRCLE) {
			viewport0.set(VIEWPORT_TYPE, CIRCLE);
			viewport0.set(RANGE, 75);
			viewport1.set(RANGE, 0);
		}
		if (action === CHANGE_TO_TRIANGLE) {
			viewport0.set(VIEWPORT_TYPE, TRIANGLE);
			viewport0.set(WIDTH, 100);
			viewport1.set(RANGE, viewport0.get(WIDTH) / 2);
		}
		if (action === CHANGE_TO_BEAM) {
			viewport0.set(VIEWPORT_TYPE, BEAM);
			viewport0.set(WIDTH, 50);
			viewport1.set(RANGE, viewport0.get(WIDTH));
		}
	}

	function update(deltaTime) {
		// LOOP_GO(FALSE);
		// stats.begin();
		light0.set(X, _mouseX);
		light0.set(Y, _mouseY);
		var ySpeed = -viewport0.get(VELOCITY_Y) * deltaTime / 4;
		var xSpeed = viewport0.get(VELOCITY_X) * deltaTime / 4;
		viewport0.set(X, viewport0.get(X) + xSpeed);
		viewport0.set(Y, viewport0.get(Y) + ySpeed);
		var ySpeed = -viewport1.get(VELOCITY_Y) * deltaTime / 4;
		var xSpeed = viewport1.get(VELOCITY_X) * deltaTime / 4;
		viewport1.set(X, viewport1.get(X) + xSpeed);
		viewport1.set(Y, viewport1.get(Y) + ySpeed);
		var deltaY = _mouseY - viewport0.get(Y);
		var deltaX = _mouseX - viewport0.get(X);
		var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		viewport0.set(ANGLE, angleInDegrees);
		LIGHT_PARSE();
		// stats.end();
	}



	function start() {
		_canvas = Draw.canvas;
		_ctx = _canvas.getContext('2d');

		_width = _canvas.width;
		_height = _canvas.height;
		createLights();
		createScreenObjects();
		CONTROL_ON("change", controlInner);
		LOOP_EVERY(0, update);
		LOOP_GO(TRUE);
		// (function() {
		// 	console.timeline("flamechart");
		// 	console.profile("flamechart");
		// 	setTimeout(function() {
		// 		console.timelineEnd("flamechart");
		// 		console.profileEnd("flamechart");
		// 		LOOP_GO();
		// 	}, 3000);
		// })();
	}

	function setup() {
		// stats = new Stats();
		// stats.setMode(0);
		// stats.domElement.style.position = 'absolute';
		// stats.domElement.style.left = '0px';
		// stats.domElement.style.top = '0px';

		// document.body.appendChild(stats.domElement);

		CONFIG_ACTION(LIGHTING_X, LIGHTING_Y, TURNCW, TURNCCW, MOVEUP, MOVEDOWN, CHANGE_TO_PROJECTION, CHANGE_TO_CIRCLE, CHANGE_TO_TRIANGLE, CHANGE_TO_BEAM); // two movement planes are needed since thats how the controls handle the axes
		CONFIG_INPUT(MOUSE, 0);
		CONFIG_BIND(MOUSE, 0, LIGHTING_X, MOUSE_X);
		CONFIG_BIND(MOUSE, 0, LIGHTING_Y, MOUSE_Y);
		CONTROL_LISTEN(document, MOUSE);
		CONFIG_INPUT(KEYBOARD, 0);
		CONFIG_BIND(KEYBOARD, 0, TURNCW, "D".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEUP, "W".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, TURNCCW, "A".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEDOWN, "S".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, CHANGE_TO_PROJECTION, "1".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, CHANGE_TO_CIRCLE, "2".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, CHANGE_TO_TRIANGLE, "3".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, CHANGE_TO_BEAM, "4".charCodeAt(0));
		CONTROL_LISTEN(document, KEYBOARD);
	}
	// end functions
	// other
	// end other
	return {
		// return
		setup: setup,
		start: start
		// end return
	};
});