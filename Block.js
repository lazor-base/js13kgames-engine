var Block = Module(function() {
	"use strict";
	// name: Block
	// targets: Client
	// filenames: Engine

	// variables
	var blocks = {};
	// end variables

	// functions

	function defaultBlockDraw(graphic, block, x, y, z) {
		var blockWidth = block.get(S_SHAPE, WIDTH);
		var blockDepth = block.get(S_SHAPE, DEPTH);
		graphic.width = blockWidth;
		graphic.height = blockDepth;
		var style = color(y);
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, blockWidth, blockDepth);
		graphic.endFill();
	}

	function color(number) {
		var hex = (15 - number);
		if (hex === 0) {
			return 0x000000;
		} else if (hex === 1) {
			return 0x111111;
		} else if (hex === 2) {
			return 0x222222;
		} else if (hex === 3) {
			return 0x333333;
		} else if (hex === 4) {
			return 0x444444;
		} else if (hex === 5) {
			return 0x555555;
		} else if (hex === 6) {
			return 0x666666;
		} else if (hex === 7) {
			return 0x777777;
		} else if (hex === 8) {
			return 0x888888;
		} else if (hex === 9) {
			return 0x999999;
		} else if (hex === 10) {
			return 0xAAAAAA;
		} else if (hex === 11) {
			return 0xBBBBBB;
		} else if (hex === 12) {
			return 0xCCCCCC;
		} else if (hex === 13) {
			return 0xDDDDDD;
		} else if (hex === 14) {
			return 0xEEEEEE;
		} else if (hex === 15) {
			return 0xFFFFFF;
		}
	}

	function makeBlock(id, width, height, depth) {
		if (blocks[id]) {
			throw new Error("Block ID already exists");
		}
		var block = SYSTEM_DEFINE_CHILD(id, BLOCK);
		block.set(S_ID, id);
		block.set(S_SHAPE, WIDTH, width);
		block.set(S_SHAPE, HEIGHT, height);
		block.set(S_SHAPE, DEPTH, depth);
		BLOCK_SET(block);
	}

	function getBlock(id) {
		return blocks[id];
	}

	function setBlock(block) {
		blocks[block.get(S_ID)] = block;
	}
	// end functions

	// other
	SYSTEM_ON("systemReady", function() {
		var blockEntity = SYSTEM_DEFINE_PARENT(BLOCK);
		blockEntity.addSystem(S_SHAPE, [BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]);
		blockEntity.addSystem(S_POSITION, [0, 0, 0]);
		blockEntity.addSystem(S_ID, [0]);
		blockEntity.addSystem(S_DRAW, [defaultBlockDraw]);
	});
	// end other

	return {
		// return
		make: makeBlock,
		get: getBlock,
		set: setBlock
		// end return
	};
});

if (typeof module !== "undefined") {
	module.exports = Block;
}