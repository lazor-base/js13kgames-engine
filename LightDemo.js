var Game = Module(function() {
	var _canvas, _ctx, stats,
	_canvasBuffer, _ctxBuffer,
	lightCanvas, lightContext,
	blockCanvas, blockContext,
	maskCanvas, maskContext,
	_width, _height,

	_ambientLightColor,

	timeElapsed,
	lastTime,

	_stageRatio,

	_mouseX = 0,
		_mouseY = 0,

		_lightId = 0,
		_lightStruct,
		_boxId = 0,
		_boxStruct;

	function Light(x, y, r, g, b, range, falloff, radius) {
		var light = _lightStruct.get();
		light.set(X, x);
		light.set(Y, y);
		light.set(R, r || 255);
		light.set(G, g || 0);
		light.set(B, b || 0);
		light.set(RANGE, range || 150);
		light.set(FALLOFF, falloff || 0);
		light.set(RADIUS, radius || 6);
		return light;
	}

	function createLights() {


		Light(400, 400, 226, 254, 77, 200);
		Light(0, 40, 103, 255, 179, 200);
		Light(620, 500, 255, 56, 209);
		Light(0, 0, 68, 192, 209, 200);
	}

	function Box(x, y, width, height, r, g, b) {
		var box = _boxStruct.get();
		box.set(X, x);
		box.set(Y, y);
		box.set(R, r || 255);
		box.set(G, g || 0);
		box.set(B, b || 107);
		box.set(WIDTH, width || 150);
		box.set(HEIGHT, height || 0);
		var tx = ((width / 2) - (-width / 2)) >> 1;
		var ty = ((height / 2) - (-height / 2)) >> 1;
		var radius = tx + ty - (Math.min(tx, ty) >> 1);
		box.set(RADIUS, radius)
		return box;
	}

	function createScreenObjects() {


		Box(100, 350, 25, 600);
		var boxA = Box(400, 300, 200, 50);
		boxA.set(ANGLE, 10);
		var boxB = Box(200, 100, 50, 50);
		boxB.set(ANGLE, 45);
		Box(300, 100, 50, 50);
		Box(400, 100, 50, 50);
		Box(500, 100, 50, 50);
		Box(200, 200, 50, 50);
		Box(200, 300, 50, 50);
		Box(200, 400, 50, 50);
		var boxC = Box(200, 500, 50, 50);
		boxC.set(ANGLE, 80);
		Box(300, 500, 50, 50);
		Box(400, 500, 50, 50);
		Box(500, 500, 50, 50);

		// _objects.push(new REAL.Circle(600, 150, 24, 40));

		// _objects.push(new REAL.EqTriangle(650, 500, 40, 40));

		// var polyPoints = [
		// new REAL.Point(0 + 65, 0 - 10),
		// new REAL.Point(0 + 50, 0 - 50),
		// new REAL.Point(0 - 50, 0 - 50),
		// new REAL.Point(0 - 50, 0 + 50),
		// new REAL.Point(0 + 50, 0 + 50)];
		// var poly = new REAL.Polygon(650, 300, polyPoints);
		// poly.setRotation(5);
		// _objects.push(poly);
	}

	function collideSphere(box, light) {
		return sphereCollision(box.get(X), box.get(Y), box.get(RADIUS), light.get(X), light.get(Y), light.get(RANGE));
	}

	function distanceSq(x1, y1, x2, y2) {
		return (((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
	}

	function sphereCollision(x1, y1, r1, x2, y2, r2) {
		return (distanceSq(x1, y1, x2, y2) <= ((r1 + r2) * (r1 + r2)));
	}

	function getNormals(box, boxVertices, positiveY) {
		var axes = LIST_GET(8, "f32");
		c = 8;

		function normal(index, previousIndex, value) {
			return getNormal(boxVertices.get(index + X), boxVertices.get(index + Y), boxVertices.get(previousIndex + X), boxVertices.get(previousIndex + Y), positiveY, value);
		}
		for (var i = 0; i < c; i += 2) {
			if (i === 0) {
				axes.set(i + X, normal(i, c - 2, X));
				axes.set(i + Y, normal(i, c - 2, Y));
			} else {
				axes.set(i + X, normal(i, i - 2, X));
				axes.set(i + Y, normal(i, i - 2, Y));
			}
		}
		return axes;
	}

	function getNormal(pt1x, pt1y, pt2x, pt2y, positiveY, value) {
		if (positiveY) {
			return normalize(-(pt2y - pt1y), (pt2x - pt1x), value);
		} else {
			return normalize((pt2y - pt1y), -(pt2x - pt1x), value);
		}
	}

	function normalize(ptx, pty, value) {
		var tmp = Math.sqrt(ptx * ptx + pty * pty);
		if (value === X) {
			return ptx / tmp
		} else if (value === Y) {
			return pty / tmp
		}
	}

	function dot(pt1x, pt1y, pt2x, pt2y) {
		return (pt1x * pt2x + pt1y * pt2y);
	}

	function castLightsToObject(light, box) {
		if (collideSphere(box, light)) {

			var i,
			c = 8, // cause we dont work with polygons
				_wallNormals,
				_lightVector = LIST_GET(8, "f32"),
				facing = 0,
				lastIndex = 0,
				lastPoint = LIST_GET(2, "f32"),
				lastPointIndex = NaN,
				firstPoint = LIST_GET(2, "f32"),
				firstPointIndex = NaN;
			var boxVertices = PHYSICS_GET_VERTICES(box, TRUE);
			boxVertices.each(function(item, index) {
				if (index % 2 === 0) {
					// even
					boxVertices.set(index, item + box.get(X));
				} else {
					boxVertices.set(index, item + box.get(Y));
				}
			});
			_wallNormals = getNormals(box, boxVertices, false);
			for (i = 0; i < c; i += 2) {
				_lightVector.set(i + X, normalize(boxVertices.get(i + X) - light.get(X), boxVertices.get(i + Y) - light.get(Y), X));
				_lightVector.set(i + Y, normalize(boxVertices.get(i + X) - light.get(X), boxVertices.get(i + Y) - light.get(Y), Y));
				if (dot(_wallNormals.get(i + X), _wallNormals.get(i + Y), _lightVector.get(i + X), _lightVector.get(i + Y)) <= 0) {
					// back facing
					if (facing == -1) {
						lastPoint.set(X, boxVertices.get(lastIndex + X));
						lastPoint.set(Y, boxVertices.get(lastIndex + Y));
						lastPointIndex = lastIndex;
					}
					facing = 1;

				} else {
					// front facing
					if (facing == 1) {
						firstPoint.set(X, boxVertices.get(lastIndex + X));
						firstPoint.set(Y, boxVertices.get(lastIndex + Y));
						firstPointIndex = lastIndex;
					}
					facing = -1;
				}
				lastIndex = i / 2;
			}
			LIST_PUT(_wallNormals);
			_wallNormals = null;

			if (isNaN(lastPointIndex)) {
				lastPointIndex = lastIndex;
			}

			if (isNaN(firstPointIndex)) {
				firstPointIndex = lastIndex;
			}
			if (lastPointIndex != firstPointIndex) {
				// drawing the shadow volume (using near and far + 2 loops)
				i = firstPointIndex;

				var shadowFar = LIST_GET(8, "f32");
				var shadowNear = LIST_GET(8, "f32");
				var increment = 0;
				while (i != lastPointIndex) {
					shadowNear.set(increment + X, boxVertices.get(i * 2 + X));
					shadowNear.set(increment + Y, boxVertices.get(i * 2 + Y));
					shadowFar.set(increment + X, boxVertices.get(i * 2 + X) + _lightVector.get(i * 2 + X) * _stageRatio);
					shadowFar.set(increment + Y, boxVertices.get(i * 2 + Y) + _lightVector.get(i * 2 + Y) * _stageRatio);
					if (i - 1 < 0) {

						i = 4 - 1;
					} else {

						i--;
					}
					increment += 2;
				}
				// last point
				shadowNear.set(increment + X, boxVertices.get(i * 2 + X));
				shadowNear.set(increment + Y, boxVertices.get(i * 2 + Y));
				shadowFar.set(increment + X, boxVertices.get(i * 2 + X) + _lightVector.get(i * 2 + X) * _stageRatio);
				shadowFar.set(increment + Y, boxVertices.get(i * 2 + Y) + _lightVector.get(i * 2 + Y) * _stageRatio);
				_ctxBuffer.fillStyle = "#000000";
				_ctxBuffer.beginPath();
				_ctxBuffer.moveTo(shadowNear.get(0 + X), shadowNear.get(0 + Y));
				for (i = 0; i < shadowNear.length; i += 2) {
					if (shadowNear.get(i + X) !== 0 && shadowNear.get(i + Y) !== 0) {
						_ctxBuffer.lineTo(shadowNear.get(i + X), shadowNear.get(i + Y));
					}
				}


				for (i = shadowFar.length - 2; i > -1; i -= 2) {
					if (shadowNear.get(i + X) !== 0 && shadowNear.get(i + Y) !== 0) {
						_ctxBuffer.lineTo(shadowFar.get(i + X), shadowFar.get(i + Y));
					}
				}

				_ctxBuffer.closePath();
				_ctxBuffer.fill();
				// LOOP_GO();
			}
			LIST_PUT(lastPoint);
			LIST_PUT(firstPoint);
			LIST_PUT(boxVertices);
			LIST_PUT(_lightVector);
			LIST_PUT(shadowNear);
			LIST_PUT(shadowFar);
		}

	}

	function updateLights() {
		var light0 = _lightStruct.first;
		light0.set(X, _mouseX);
		light0.set(Y, _mouseY);
	}

	function renderLightsAndShadowsInner(light) {
		// paint the lights in the buffer
		_ctxBuffer.clearRect(0, 0, _width, _height);
		var radGrad = _ctxBuffer.createRadialGradient(light.get(X), light.get(Y), 0, light.get(X), light.get(Y), light.get(RANGE));
		radGrad.addColorStop(0, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ',1)');
		radGrad.addColorStop(1, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ', ' + light.get(FALLOFF) + ')');
		_ctxBuffer.fillStyle = radGrad;
		_ctxBuffer.fillRect(0, 0, _width, _height);
		_ctxBuffer.globalCompositeOperation = "source-over";
		_ctx.drawImage(_canvasBuffer, 0, 0);
	}

	function renderLightsAndShadows() {
		_lightStruct.each(renderLightsAndShadowsInner);
		_ctx.globalAlpha = 1;
	}

	function updateObjectsInner(box, context) {
		context.globalAlpha = 1;
		var color = 'rgb(' + box.get(R) + ',' + box.get(G) + ',' + box.get(B) + ')';
		DRAW_POLY(box, context, color, color);
	}

	function updateObjects() {
		_boxStruct.each(function(box) {
			var initialValue = box.get(ANGLE);
			var rotVal = initialValue * timeElapsed;
			// box.set(ANGLE, initialValue + rotVal);
			Draw.setup(box, _ctx, updateObjectsInner);
		});
	}

	function maskInner(light) {
		_ctxBuffer.save();
		// paint the lights in the buffer
		_ctxBuffer.clearRect(0, 0, _width, _height);
		var radGrad = _ctxBuffer.createRadialGradient(light.get(X), light.get(Y), 0, light.get(X), light.get(Y), light.get(RANGE));
		radGrad.addColorStop(0, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ',1)');
		radGrad.addColorStop(1, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ', ' + light.get(FALLOFF) + ')');
		_ctxBuffer.fillStyle = radGrad;
		_ctxBuffer.fillRect(0, 0, _width, _height);

		_ctxBuffer.globalCompositeOperation = "destination-out";

		_boxStruct.each(function(box) {
			castLightsToObject(light, box);
		});


		_ctxBuffer.globalCompositeOperation = "xor";
		_ctxBuffer.fillStyle = "rgba(0,0,0,0)";
		_ctxBuffer.fillRect(0, 0, _width, _height);
		_ctxBuffer.restore();

		// paint buffer in canvas
		maskContext.drawImage(_canvasBuffer, 0, 0);
	}

	function mask() {
		maskContext.clearRect(0, 0, _width, _height);
		maskContext.fillStyle = "rgba(0,0,0,0)";
		maskContext.fillRect(0, 0, _width, _height);

		_lightStruct.each(maskInner);

		_ctx.drawImage(maskCanvas, 0, 0);
	}



	function start() {
		_canvas = Draw.canvas;
		_ctx = _canvas.getContext('2d');

		_canvasBuffer = GUI.make("canvas");
		_ctxBuffer = _canvasBuffer.getContext('2d');
		lightCanvas = GUI.make("canvas");
		lightContext = lightCanvas.getContext('2d');
		blockCanvas = GUI.make("canvas");
		blockContext = blockCanvas.getContext('2d');
		maskCanvas = GUI.make("canvas");
		maskContext = maskCanvas.getContext('2d');


		_width = _canvas.width;
		_height = _canvas.height;
		_canvasBuffer.width = maskCanvas.width = blockCanvas.width = lightCanvas.width = _width;
		_canvasBuffer.height = maskCanvas.height = blockCanvas.height = lightCanvas.height = _height;

		_stageRatio = Math.sqrt((_width * _width) + (_height * _height));

		timeElapsed = 0;
		lastTime = 0;

		_ambientLightColor = "rgba(0, 0, 0, 0.75)";


		createLights();


		createScreenObjects();

		function controlInner(localId, action, value) {
			if (action === LIGHTING_X) {
				_mouseX = value - _canvas.offsetLeft;
			}
			if (action === LIGHTING_Y) {
				_mouseY = value - _canvas.offsetTop;
			}
		}

		CONTROL_ON("change", controlInner);



		function update() {

			stats.begin();


			_ctx.clearRect(0, 0, _width, _height);

			_ctx.fillStyle = _ambientLightColor;
			_ctx.fillRect(0, 0, _width, _height);
			_ctx.save();


			updateLights();
			_ctx.globalAlpha = 0.8;


			renderLightsAndShadows();
			_ctx.globalAlpha = 1;


			updateObjects();
			_ctx.globalCompositeOperation = 'destination-atop';


			mask();
			_ctx.restore();

			timeElapsed = (Date.now() - lastTime) / 1000;
			lastTime = Date.now();
			stats.end();
		}
		_ctx.fillStyle = "black";
		_ctx.fillRect(50, 100, 100, 100);
		LOOP_EVERY(0, update);
		LOOP_GO(TRUE);
	}

	function setup() {
		stats = new Stats();
		stats.setMode(0);
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		document.body.appendChild(stats.domElement);

		CONFIG_ACTION(LIGHTING_X, LIGHTING_Y); // two movement planes are needed since thats how the controls handle the axes
		CONFIG_INPUT(MOUSE, 0);
		CONFIG_BIND(MOUSE, 0, LIGHTING_X, MOUSE_X);
		CONFIG_BIND(MOUSE, 0, LIGHTING_Y, MOUSE_Y);
		CONTROL_LISTEN(document, MOUSE);

		_lightId = STRUCT_MAKE(13, "f32");
		_lightStruct = STRUCT_GET(_lightId);

		_boxId = STRUCT_MAKE(11, "f32");
		_boxStruct = STRUCT_GET(_boxId);
	}
	return {
		setup: setup,
		start: start,
		ip: "127.0.0.1"
	};
});