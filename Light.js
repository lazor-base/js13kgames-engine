var Light = Module(function(event) {
	var _canvas, _ctx, stats,
	_canvasBuffer, _ctxBuffer,
	lightCanvas, lightContext,
	blockCanvas, blockContext,
	maskCanvas, maskContext,
	_width, _height,

	_ambientLightColor,

	timeElapsed,
	lastTime,

	_lightStruct,
	_boxStruct,
	_stageRatio;

	var _mouseX = _mouseY = _lightId = _boxId = 0;
	GUI_ON("ready", function() {
		_lightId = STRUCT_MAKE(13, "f32");
		_lightStruct = STRUCT_GET(_lightId);

		_boxId = STRUCT_MAKE(11, "f32");
		_boxStruct = STRUCT_GET(_boxId);
	});

});