var Block = Module(function(event) {
	// name: Block
	// targets: Client
	// filenames: Engine

	// variables
	var blocks = {};
	// end variables

	// functions

///////////
// DEOPT //
///////////
	function defaultBlockDraw(graphic, block, x, y, z, heightMapData, blockData) {
		var blockWidth = block[BLOCK_WIDTH];
		var blockDepth = block[BLOCK_DEPTH];
		graphic.width = blockWidth;
		graphic.height = blockDepth;
		var style = color(y);
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, blockWidth, blockDepth);
		graphic.endFill();
	}

	function color(number) {
		var hex = (15 - number).toString(16);
		var string = hex + hex + hex + hex + hex + hex;
		return parseInt(string, 16);
	}

	function makeBlock(id, width, height, depth, textureFn) {
		if (blocks[id]) {
			throw new Error("Block ID already exists");
		}
		var block = new Uint16Array(4);
		block[BLOCK_ID] = id;
		block[BLOCK_WIDTH] = width;
		block[BLOCK_HEIGHT] = height;
		block[BLOCK_DEPTH] = depth;
		block.drawFn = textureFn || defaultBlockDraw;
		blocks[id] = block;
	}

	function getBlock(id) {
		return blocks[id];
	}
	// end functions

	// other
	// end other

	return {
		// return
		make: makeBlock,
		get: getBlock
		// end return
	};
})