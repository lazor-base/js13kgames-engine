var Light = Module(function() {
	// DoNotBuildname: Light
	// target: Client
	// filenames: Engine

	// variables
	var walls = [];
	var lights = [];
	var viewPorts = [];
	var buffers = [];
	var eachLight;
	var eachWall;
	var eachViewPort;
	var eachMask;
	var canvas, context,
	bufferCanvas, bufferContext,
	maskCanvas, maskContext,
	canvasWidth, canvasHeight,
	axes,
	shadowFar,
	shadowNear,
	_lightVector,
	lastPoint,
	firstPoint,


	_lightStruct,
	_viewPortStruct,
	_wallStruct;

	var _ambientLightColor = "#000";
	var _stageRatio = 0;
	var _lightId = 0;
	var _wallId = 0;
	var _viewPortId = 0;
	// end variables

	// functions

	function makeBuffer(width, height, index) {
		var buffer = GUI_MAKE("canvas");
		GUI_SET(buffer, "width", width);
		GUI_SET(buffer, "height", height);
		// GUI_SET(buffer, "id", index || buffers.length);
		buffer.id = index || buffers.length;
		buffers.push(buffer);
		// GUI_PUT(buffer);
		return buffer;
	}

	function getBuffer(index, width, height) {
		return buffers[index] || makeBuffer(width, height, index);
	}

	function newLight(x, y, r, g, b, range, falloff, radius) {
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

	function newViewPort(x, y, type, rangeOrWidth, height) {
		var viewportItem = _viewPortStruct.get();
		viewportItem.set(X, x);
		viewportItem.set(Y, y);
		viewportItem.set(RANGE, Math.sqrt(_stageRatio));
		if (type === CIRCLE) {
			viewportItem.set(RANGE, rangeOrWidth);
		}
		if (type === TRIANGLE) {
			viewportItem.set(RANGE, rangeOrWidth + height);
			viewportItem.set(WIDTH, rangeOrWidth);
			viewportItem.set(HEIGHT, height);
		}
		if (type === BEAM) {
			viewportItem.set(WIDTH, rangeOrWidth);
			viewportItem.set(HEIGHT, height);
		}
		viewportItem.set(VIEWPORT_TYPE, type);
		viewportItem.set(RADIUS, 6);
		return viewportItem;
	}

	function newWall(x, y, width, height, r, g, b) {
		var wall = _wallStruct.get();
		wall.set(X, x);
		wall.set(Y, y);
		wall.set(R, r || 255);
		wall.set(G, g || 0);
		wall.set(B, b || 107);
		wall.set(WIDTH, width || 150);
		wall.set(HEIGHT, height || 0);
		var tx = ((width / 2) - (-width / 2)) >> 1;
		var ty = ((height / 2) - (-height / 2)) >> 1;
		var radius = tx + ty - (Math.min(tx, ty) >> 1);
		wall.set(RADIUS, radius);
		return wall;
	}

	function collideSphere(wall, light) {
		return sphereCollision(wall.get(X), wall.get(Y), wall.get(RADIUS), light.get(X), light.get(Y), light.get(RANGE));
	}

	function distanceSq(x1, y1, x2, y2) {
		return (((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
	}

	function sphereCollision(x1, y1, r1, x2, y2, r2) {
		return (distanceSq(x1, y1, x2, y2) <= ((r1 + r2) * (r1 + r2)));
	}

	function _getNormals(wallVertices, positiveY) {
		c = 8;

		function _normal(index, previousIndex, value) {
			return _getNormal(wallVertices.get(index + X), wallVertices.get(index + Y), wallVertices.get(previousIndex + X), wallVertices.get(previousIndex + Y), positiveY, value);
		}
		for (var i = 0; i < c; i += 2) {
			if (i === 0) {
				axes.set(i + X, _normal(i, c - 2, X));
				axes.set(i + Y, _normal(i, c - 2, Y));
			} else {
				axes.set(i + X, _normal(i, i - 2, X));
				axes.set(i + Y, _normal(i, i - 2, Y));
			}
		}
		return axes;
	}

	function _getNormal(pt1x, pt1y, pt2x, pt2y, positiveY, value) {
		if (positiveY) {
			return _normalize(-(pt2y - pt1y), (pt2x - pt1x), value);
		} else {
			return _normalize((pt2y - pt1y), -(pt2x - pt1x), value);
		}
	}

	function _normalize(ptx, pty, value) {
		var tmp = Math.sqrt(ptx * ptx + pty * pty);
		if (value === X) {
			return ptx / tmp;
		} else if (value === Y) {
			return pty / tmp;
		}
	}

	function _dot(pt1x, pt1y, pt2x, pt2y) {
		return (pt1x * pt2x + pt1y * pt2y);
	}

	function castLightsToObject(light, wall, _context) {
		DRAW_CHANGE(_context, "fillStyle", _ambientLightColor);
		if (collideSphere(wall, light)) {

			var i,
			c = 8, // cause we dont work with polygons
				_wallNormals,
				facing = 0,
				lastIndex = 0,
				lastPointIndex = NaN,
				firstPointIndex = NaN;
			LIST_CLEAN(_lightVector);
			LIST_CLEAN(lastPoint);
			LIST_CLEAN(firstPoint);
			LIST_CLEAN(shadowNear);
			LIST_CLEAN(shadowFar);
			LIST_CLEAN(axes);
			var wallVertices = PHYSICS_GET_VERTICES(wall, TRUE);
			wallVertices.each(function wallVertice(item, index) {
				if (index % 2 === 0) {
					// even
					wallVertices.set(index, item + wall.get(X));
				} else {
					wallVertices.set(index, item + wall.get(Y));
				}
			});
			_wallNormals = _getNormals(wallVertices, false);
			for (i = 0; i < c; i += 2) {
				_lightVector.set(i + X, _normalize(wallVertices.get(i + X) - light.get(X), wallVertices.get(i + Y) - light.get(Y), X));
				_lightVector.set(i + Y, _normalize(wallVertices.get(i + X) - light.get(X), wallVertices.get(i + Y) - light.get(Y), Y));
				if (_dot(_wallNormals.get(i + X), _wallNormals.get(i + Y), _lightVector.get(i + X), _lightVector.get(i + Y)) <= 0) {
					// back facing
					if (facing == -1) {
						lastPoint.set(X, wallVertices.get(lastIndex + X));
						lastPoint.set(Y, wallVertices.get(lastIndex + Y));
						lastPointIndex = lastIndex;
					}
					facing = 1;

				} else {
					// front facing
					if (facing == 1) {
						firstPoint.set(X, wallVertices.get(lastIndex + X));
						firstPoint.set(Y, wallVertices.get(lastIndex + Y));
						firstPointIndex = lastIndex;
					}
					facing = -1;
				}
				lastIndex = i / 2;
			}

			if (isNaN(lastPointIndex)) {
				lastPointIndex = lastIndex;
			}

			if (isNaN(firstPointIndex)) {
				firstPointIndex = lastIndex;
			}
			if (lastPointIndex != firstPointIndex) {
				// drawing the shadow volume (using near and far + 2 loops)
				i = firstPointIndex;


				var increment = 0;
				while (i != lastPointIndex) {
					shadowNear.set(increment + X, wallVertices.get(i * 2 + X));
					shadowNear.set(increment + Y, wallVertices.get(i * 2 + Y));
					shadowFar.set(increment + X, wallVertices.get(i * 2 + X) + _lightVector.get(i * 2 + X) * _stageRatio);
					shadowFar.set(increment + Y, wallVertices.get(i * 2 + Y) + _lightVector.get(i * 2 + Y) * _stageRatio);
					if (i - 1 < 0) {

						i = 4 - 1;
					} else {

						i--;
					}
					increment += 2;
				}
				// last point
				shadowNear.set(increment + X, wallVertices.get(i * 2 + X));
				shadowNear.set(increment + Y, wallVertices.get(i * 2 + Y));
				shadowFar.set(increment + X, wallVertices.get(i * 2 + X) + _lightVector.get(i * 2 + X) * _stageRatio);
				shadowFar.set(increment + Y, wallVertices.get(i * 2 + Y) + _lightVector.get(i * 2 + Y) * _stageRatio);
				_context.beginPath();
				_context.moveTo(shadowNear.get(0 + X), shadowNear.get(0 + Y));
				for (i = 0; i < shadowNear.length; i += 2) {
					if (shadowNear.get(i + X) !== 0 && shadowNear.get(i + Y) !== 0) {
						_context.lineTo(shadowNear.get(i + X), shadowNear.get(i + Y));
					}
				}


				for (i = shadowFar.length - 2; i > -1; i -= 2) {
					if (shadowNear.get(i + X) !== 0 && shadowNear.get(i + Y) !== 0) {
						_context.lineTo(shadowFar.get(i + X), shadowFar.get(i + Y));
					}
				}

				_context.closePath();
				_context.fill();
			}
			LIST_PUT(wallVertices);
		}

	}

	function maskInner(light, _context) {
		_context.save();
		// paint the lights in the buffer
		// _context.clearRect(0, 0, canvasWidth, canvasHeight);
		// drawLightsDefault(light, _context);
		eachLight(light, _context);
		DRAW_CHANGE(_context, "globalCompositeOperation", "destination-out");

		for (var i = 0; i < walls.length; i++) {
			walls[i].each(function forEachWall(wall) {
				castLightsToObject(light, wall, _context);
			});
		}

		// DRAW_CHANGE(_context, "globalCompositeOperation", "xor");
		// DRAW_CHANGE(_context, "fillStyle", "rgba(0,0,0,1)");
		// _context.fillRect(0, 0, canvasWidth, canvasHeight);
		_context.restore();

		// paint buffer in canvas
		bufferContext.drawImage(_context.canvas, light.get(X)-light.get(RANGE), light.get(Y)-light.get(RANGE), light.get(RANGE)*2, light.get(RANGE)*2, light.get(X)-light.get(RANGE), light.get(Y)-light.get(RANGE), light.get(RANGE)*2, light.get(RANGE)*2);
		// bufferContext.drawImage(_context.canvas, 0,0);
	}

	function viewPortInner(viewPort) {
		var viewPortWidth = viewPort.get(WIDTH);
		var viewPortHeight = viewPort.get(HEIGHT);

		function drawTriangle() {
			DRAW_SETUP(viewPort, bufferContext, function() {
				DRAW_CHANGE(bufferContext, "fillStyle", _ambientLightColor);
				bufferContext.moveTo(0, 0); // give the (x,y) coordinates
				bufferContext.lineTo(0, 0 - viewPortWidth / 8);
				bufferContext.lineTo(0 + viewPortHeight, 0 - viewPortWidth / 2);
				bufferContext.lineTo(0 + viewPortHeight, 0 + viewPortWidth / 2);
				bufferContext.lineTo(0, 0 + viewPortWidth / 8);
				bufferContext.lineTo(0, 0);
				bufferContext.fill();
				bufferContext.closePath();
			});
		}

		function drawBeam() {
			DRAW_SETUP(viewPort, bufferContext, function() {
				DRAW_CHANGE(bufferContext, "fillStyle", _ambientLightColor);
				bufferContext.moveTo(0, 0); // give the (x,y) coordinates
				bufferContext.lineTo(0, 0 - viewPortWidth / 2);
				bufferContext.lineTo(0 + viewPortHeight, 0 - viewPortWidth / 2);
				bufferContext.lineTo(0 + viewPortHeight, 0 + viewPortWidth / 2);
				bufferContext.lineTo(0, 0 + viewPortWidth / 2);
				bufferContext.lineTo(0, 0);
				bufferContext.fill();
				bufferContext.closePath();
			});
		}
		bufferContext.save();
		bufferContext.clearRect(0, 0, canvasWidth, canvasHeight);
		var type = viewPort.get(VIEWPORT_TYPE);
		if (type === PROJECTION || type === CIRCLE) {
			var radGrad = bufferContext.createRadialGradient(viewPort.get(X), viewPort.get(Y), 0, viewPort.get(X), viewPort.get(Y), viewPort.get(RANGE));
			radGrad.addColorStop(0.5, _ambientLightColor);
			radGrad.addColorStop(1, 'rgba(0,0,0,0)');
			DRAW_CHANGE(bufferContext, "fillStyle", radGrad);
			bufferContext.fillRect(0, 0, canvasWidth, canvasHeight);
			DRAW_CHANGE(bufferContext, "globalCompositeOperation", "destination-out");

			for (var i = 0; i < walls.length; i++) {
				walls[i].each(function forEachWall(wall) {
					castLightsToObject(viewPort, wall, context);
				});
			}


			// DRAW_CHANGE(bufferContext, "globalCompositeOperation", "xor");
			// DRAW_CHANGE(bufferContext, "fillStyle", "rgba(0,0,0,0)");
			// bufferContext.fillRect(0, 0, canvasWidth, canvasHeight);
			bufferContext.restore();

			// paint buffer in canvas
			maskContext.drawImage(bufferCanvas, 0, 0);
		}
		if (type === TRIANGLE || type === BEAM) {
			if (type === TRIANGLE) {
				drawTriangle();
			}
			if (type === BEAM) {
				drawBeam();
			}
			DRAW_CHANGE(bufferContext, "globalCompositeOperation", "destination-out");

			for (var i = 0; i < walls.length; i++) {
				walls[i].each(function forEachWall(wall) {
					castLightsToObject(viewPort, wall);
				});
			}
			DRAW_CHANGE(bufferContext, "globalCompositeOperation", "destination-in");
			if (type === TRIANGLE) {
				drawTriangle();
			}
			if (type === BEAM) {
				drawBeam();
			}

			DRAW_CHANGE(bufferContext, "globalCompositeOperation", "destination-in");
			var radGrad = bufferContext.createRadialGradient(viewPort.get(X), viewPort.get(Y), 0, viewPort.get(X), viewPort.get(Y), viewPort.get(HEIGHT));
			radGrad.addColorStop(0, _ambientLightColor);
			radGrad.addColorStop(1, 'rgba(0,0,0,0)');
			DRAW_CHANGE(bufferContext, "fillStyle", radGrad);
			bufferContext.fillRect(0, 0, canvasWidth, canvasHeight);


			// DRAW_CHANGE(bufferContext, "globalCompositeOperation", "xor");
			// DRAW_CHANGE(bufferContext, "fillStyle", "rgba(0,0,0,0)");
			// bufferContext.fillRect(0, 0, canvasWidth, canvasHeight);
			bufferContext.restore();

			// paint buffer in canvas
			// maskContext.drawImage(bufferCanvas, 0, 0);
			context.drawImage(bufferCanvas, 0, 0);
		}
	}

	function sharedMaskViewportCode(light) {

	}

	function drawLightsDefault(light, _context) {
		// paint the lights in the buffer
		// _context.clearRect(0, 0, canvasWidth, canvasHeight);
		var radGrad = _context.createRadialGradient(light.get(X), light.get(Y), 0, light.get(X), light.get(Y), light.get(RANGE));
		radGrad.addColorStop(0, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ',1)');
		radGrad.addColorStop(1, 'rgba(' + light.get(R) + ',' + light.get(G) + ',' + light.get(B) + ', ' + light.get(FALLOFF) + ')');
		DRAW_CHANGE(_context, "fillStyle", radGrad);
		_context.fillRect(0, 0, canvasWidth, canvasHeight);
		_context.globalCompositeOperation = "source-over";
	}

	function drawWallsDefault(wall, context) {
		DRAW_SETUP(wall, context, function() {
			DRAW_CHANGE(context, "globalAlpha", 1);
			var color = 'rgb(' + wall.get(R) + ',' + wall.get(G) + ',' + wall.get(B) + ')';
			DRAW_POLY(wall, context, color, color);
		});
	}

	function parseLight(drawWalls, drawLights) {
		eachLight = drawLights || drawLightsDefault;
		eachWall = drawWalls || drawWallsDefault;
		eachViewPort = viewPortInner;
		eachMask = maskInner;
		var i = 0;
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		DRAW_CHANGE(context, "fillStyle", _ambientLightColor);
		context.fillRect(0, 0, canvasWidth, canvasHeight);
		context.save();

		DRAW_CHANGE(context, "globalAlpha", 0.8);
		// draw lights step
		for (i = 0; i < lights.length; i++) {
			lights[i].each(function eachItemCallback(item) {
				eachLight(item, context);
			});
		}
		// light step end

		DRAW_CHANGE(context, "globalAlpha", 1);

		// draw walls step
		for (i = 0; i < walls.length; i++) {
			walls[i].each(function eachItemCallback(item) {
				eachWall(item, context);
			});
		}
		// wall step end

		DRAW_CHANGE(context, "globalCompositeOperation", 'destination-atop');

		// draw mask step
		var index = 0;
				bufferContext.clearRect(0, 0, canvasWidth, canvasHeight);
		for (i = 0; i < lights.length; i++) {
			lights[i].each(function eachItemCallback(item) {
				var buffer = getBuffer(index, canvasWidth, canvasHeight).getContext('2d');
				buffer.clearRect(0, 0, canvasWidth, canvasHeight);

				eachMask(item, buffer);
				index++;
			});
		}
		DRAW_CHANGE(bufferContext, "globalCompositeOperation", "xor");
		DRAW_CHANGE(bufferContext, "fillStyle", "rgba(0,0,0,1)");
		bufferContext.fillRect(0, 0, canvasWidth, canvasHeight);
		// context.drawImage(bufferCanvas, 0, 0);
		// mask step end

		// draw viewport step
		// maskContext.clearRect(0, 0, canvasWidth, canvasHeight);
		// DRAW_CHANGE(maskContext, "fillStyle", "rgba(0,0,0,0)");
		// maskContext.fillRect(0, 0, canvasWidth, canvasHeight);
		// for (i = 0; i < viewPorts.length; i++) {
		// 	viewPorts[i].each(eachViewPort);
		// }
		// context.drawImage(maskCanvas, 0, 0);
		// viewport step end
		context.restore();
	}

	function addLight(linkedList) {
		lights.push(linkedList);
	}

	function addWall(linkedList) {
		walls.push(linkedList);
	}

	function addViewPort(linkedList) {
		viewPorts.push(linkedList);
	}

	// end functions

	// other
	GUI_ON("ready", function() {
		axes = LIST_GET(8, "f32");
		shadowFar = LIST_GET(8, "f32");
		shadowNear = LIST_GET(8, "f32");
		_lightVector = LIST_GET(8, "f32");
		lastPoint = LIST_GET(2, "f32");
		firstPoint = LIST_GET(2, "f32");

		_lightId = STRUCT_MAKE(13, "s16");
		_lightStruct = STRUCT_GET(_lightId);
		addLight(_lightStruct);

		_viewPortId = STRUCT_MAKE(12, "s16");
		_viewPortStruct = STRUCT_GET(_viewPortId);
		addViewPort(_viewPortStruct);

		_wallId = STRUCT_MAKE(11, "s16");
		_wallStruct = STRUCT_GET(_wallId);
		addWall(_wallStruct);

		canvas = Draw.canvas;
		context = canvas.getContext('2d');

		bufferCanvas = GUI_MAKE("canvas");
		bufferContext = bufferCanvas.getContext('2d');
		maskCanvas = GUI_MAKE("canvas");
		maskContext = maskCanvas.getContext('2d');
		GUI_PUT(bufferCanvas)



		canvasWidth = canvas.width;
		canvasHeight = canvas.height;
		bufferCanvas.width = maskCanvas.width = canvasWidth;
		bufferCanvas.height = maskCanvas.height = canvasHeight;

		_stageRatio = (canvasWidth * canvasWidth) + (canvasHeight * canvasHeight);
	});
	// end other

	return {
		// return
		source: newLight,
		view: newViewPort,
		wall: newWall,
		parse: parseLight,
		addLight: addLight,
		addViewPort: addViewPort,
		addWall: addWall
		// end return
	};

});