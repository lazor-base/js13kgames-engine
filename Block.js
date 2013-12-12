var Block = Module(function(event) {
	// name: Block
	// targets: Client
	// filenames: Engine

	// variables
	var blocks = {};
	// end variables

	// functions
	function makeBlock(id, width,height,depth, textureFn) {
		if(blocks[id]) {
			throw new Error("Block ID already exists");
		}
		var block = LIST_GET(4, UINT16);
		block.set(BLOCK_ID,id);
		block.set(BLOCK_WIDTH,width);
		block.set(BLOCK_HEIGHT,height);
		block.set(BLOCK_DEPTH,depth);
		block.drawFn = textureFn;
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
		make:makeBlock,
		get:getBlock
		// end return
	};
})