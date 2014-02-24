var Block = Module(function(event) {
	// name: Block
	// targets: Client
	// filenames: Engine

	// variables
	var blocks = {};
	// end variables

	// functions

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
		var hex = (15 - number);
		if(hex === 0) {
			return 0x000000;
		} else if(hex === 1) {
			return 0x111111;
		} else if(hex === 2) {
			return 0x222222;
		} else if(hex === 3) {
			return 0x333333;
		} else if(hex === 4) {
			return 0x444444;
		} else if(hex === 5) {
			return 0x555555;
		} else if(hex === 6) {
			return 0x666666;
		} else if(hex === 7) {
			return 0x777777;
		} else if(hex === 8) {
			return 0x888888;
		} else if(hex === 9) {
			return 0x999999;
		} else if(hex === 10) {
			return 0xAAAAAA;
		} else if(hex === 11) {
			return 0xBBBBBB;
		} else if(hex === 12) {
			return 0xCCCCCC;
		} else if(hex === 13) {
			return 0xDDDDDD;
		} else if(hex === 14) {
			return 0xEEEEEE;
		} else if(hex === 15) {
			return 0xFFFFFF;
		}
	}

	function makeBlock(id, width, height, depth, textureFn) {
		if (blocks[id]) {
			throw new Error("Block ID already exists");
		}
		var block = new Uint16Array(BLOCK_ENTRIES);
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