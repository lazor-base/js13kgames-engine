var Map = Module(function(event) {
	// name: Map
	// targets: Client
	// filenames: Engine

	// variables
	var chunks = {
		current: {},
		old: []
	};
	var chunkHeight = CHUNK_HEIGHT;
	var numberOfBlocksPerAxis = CHUNK_DIMENTION;
	var numberOfYChunks = chunkHeight / numberOfBlocksPerAxis;
	var numberOfBlocksPerChunk = numberOfBlocksPerAxis * numberOfBlocksPerAxis * numberOfBlocksPerAxis;
	var numberOfBlocksPerYAxis = numberOfBlocksPerAxis * numberOfBlocksPerAxis;
	var graphics = new PIXI.Graphics();
	var textHost = new PIXI.DisplayObjectContainer();
	var worker = new Worker('WebWorker.js');
	var onScreen = [];
	var blockCache = {};
	var mapOffsetX = 0;
	var mapOffsetY = 0;
	var viewPortX = 0;
	var viewPortY = 0;
	var viewPortZ = 0;
	var oldViewPortX = viewPortX;
	var oldViewPortY = viewPortY;
	var oldViewPortZ = viewPortZ;
	var firstRun = true;
	// end variables

	// functions

	function round(number) {
		if (number > 0) {
			return 1;
		} else if (number < 0 || number === 0) {
			return 0;
		}
	}

	function moveMap(x, y, z) {
		var oldViewPortX = viewPortX;
		var oldViewPortY = viewPortY;
		var oldViewPortZ = viewPortZ;
		if (x !== null) {
			viewPortX += x;
			mapOffsetX += x;
			graphics.position.x = mapOffsetX;
			textHost.position.x = mapOffsetX;
		}
		if (y !== null) {
			if (y < 0) {
				viewPortY--;
			} else {
				viewPortY++;
			}
			if (viewPortY > numberOfBlocksPerAxis - 2) { // always show ground (15) layer
				viewPortY = numberOfBlocksPerAxis - 2;
			}
			if (viewPortY < 0) {
				viewPortY = 0;
			}
		}
		if (z !== null) {
			viewPortZ += z;
			mapOffsetY += z;
			graphics.position.y = mapOffsetY;
			textHost.position.y = mapOffsetY;
		}
		if (oldViewPortX !== viewPortX || oldViewPortY !== viewPortY || oldViewPortZ !== viewPortZ) {
			return true;
		}
		return false;
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function makeChunk(positionX, positionZ) {
		var recycledChunk = false;
		if (chunks.current[positionX + "," + positionZ]) {
			return chunks.current[positionX + "," + positionZ];
		}
		var chunk;
		if (chunks.old.length) {
			recycledChunk = true
			// console.time("recycled chunk")
			chunk = chunks.old.pop();
			chunk.Data = new Int8Array(4);
			chunk.Biomes;
			chunk.HeightMap;
			chunk.Blocks;
			chunk.BlockData = new Uint8Array(numberOfBlocksPerChunk);
		} else {
			// console.time("chunk")
			var data = new Int16Array(4);
			var biomes = new Uint8Array(numberOfBlocksPerYAxis);
			var height = new Uint8Array(numberOfBlocksPerYAxis);
			var blocks = new Uint16Array(numberOfBlocksPerChunk);
			var blockData = new Uint8Array(numberOfBlocksPerChunk);
			chunk = {
				Renderable: false,
				Data: data,
				Biomes: biomes,
				HeightMap: height,
				Blocks: blocks,
				BlockData: blockData
			};
		}
		chunk.Data[CHUNK_X] = positionX;
		chunk.Data[CHUNK_Z] = positionZ;
		worker.postMessage([BUILD_CHUNK, positionX, positionZ, chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer], [chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer]);
		chunks.current[positionX + "," + positionZ] = chunk;
		if (recycledChunk) {
			// console.timeEnd("recycled chunk");
		} else {
			// console.timeEnd("chunk");
		}
		return chunk;
	}

	function chunkBlockAlgorithm(x, y, z, lastXBlock, lastYBlock, lastZBlock) {
		if (y === 15) {
			var data = 1;
		} else if (y === 8) {
			var data = 1;
		} else if (y < 8 && y > 4) {
			if (lastYBlock > 0) {
				var data = round(getRandomInt(-8, y / 2));
			} else {
				var data = 0;
			}
		} else if (y < 5) {
			var data = 0;
		} else {
			var data = round(getRandomInt(-1, 9));
		}
		return data;
	}

	function cleanChunks(attr) {
		if (onScreen.indexOf(attr) === -1) {
			if (chunks.current[attr].Renderable) {
				chunks.current[attr].Renderable = false;
				chunks.old.push(chunks.current[attr]);
			}
			delete chunks.current[attr];
		}
	}

	function divideScreen(force) {
		console.clear();
		console.time("divide screen")

		onScreen.length = 0;
		var width = window.innerWidth;
		var height = window.innerHeight;
		var chunkPixelSize = BLOCK_SIZE * numberOfBlocksPerAxis;
		var verticalChunks = height / chunkPixelSize;
		var horizontalChunks = width / chunkPixelSize;
		var Xcoordinate = Math.floor(-viewPortX / chunkPixelSize);
		var Zcoordinate = Math.floor(-viewPortZ / chunkPixelSize);
		if (oldViewPortX !== viewPortX || oldViewPortZ !== viewPortZ || force) {
			for (var i = -1; i < verticalChunks + 1; i++) {
				for (var e = -1; e < horizontalChunks + 1; e++) {
					onScreen.push((Xcoordinate + e) + "," + (Zcoordinate + i));
				}
			}

			for (var attr in chunks.current) {
				cleanChunks(attr);
			}
		}
		if (viewPortY !== oldViewPortY || oldViewPortX !== viewPortX || oldViewPortZ !== viewPortZ || force) {
			while (textHost.children.length) {
				textHost.removeChild(textHost.children[0]);
			}
			graphics.position.x = 0;
			textHost.position.x = 0;
			graphics.position.y = 0;
			textHost.position.y = 0;
			mapOffsetX = 0;
			mapOffsetY = 0;
			graphics.clear();
			for (var i = -1; i < verticalChunks + 1; i++) {
				for (var e = -1; e < horizontalChunks + 1; e++) {
					var X = Xcoordinate + e;
					var Z = Zcoordinate + i;
					/////////////////
					//  MIXED //
					/////////////////
					if (firstRun) {
						var chunk = makeChunk(X, Z);
						drawMap(chunk);
					} else if (chunks.current[X + "," + Z] && chunks.current[X + "," + Z].Renderable) {
						drawMap(chunks.current[X + "," + Z]);
					} else {
						LOOP_QUEUE(5, function(X, Z) {
							var chunk = makeChunk(X, Z);
							drawMap(chunk);
						}, [X, Z]);
					}
					////////////////////
					// STAGGERED //
					////////////////////
					// LOOP_QUEUE(5, function(X, Z) {
						// var chunk = makeChunk(X, Z);
						// drawMap(chunk);
					// }, [X, Z]);
					//////////////////////
					// ALL AT ONCE //
					//////////////////////
					// var chunk = makeChunk(X, Z);
					// drawMap(chunk);
				}
			}
		}
		// console.log(onScreen)
		oldViewPortX = viewPortX;
		oldViewPortY = viewPortY;
		oldViewPortZ = viewPortZ;
		firstRun = false;
		console.timeEnd("divide screen")
	}

	function drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate) {
		var internalCoordinate = ((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x);
		var blockId = chunk.Blocks[internalCoordinate];
		if (blockId) {
			var blockData = chunk.BlockData[internalCoordinate] || 0;
			if (!blockCache[blockId]) {
				blockCache[blockId] = BLOCK_GET(blockId);
			}
			var block = blockCache[blockId];
			block.drawFn(graphics, block, xCoordinate, y, zCoordinate, heightMapData, blockData);
		}
	}

	function drawPartialChunk(chunk, x, z, chunkX, chunkZ) {
		var drawn = false;
		var heightMapData = chunk.HeightMap[(z * numberOfBlocksPerAxis) + x];
		var xCoordinate = (x * BLOCK_SIZE) + viewPortX - (chunkX * -512);
		var zCoordinate = (z * BLOCK_SIZE) + viewPortZ - (chunkZ * -512);
		if (viewPortY > heightMapData) {
			for (var y = viewPortY; y < numberOfBlocksPerAxis; y++) {
				return drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate);
			}
		} else { // if we aren't looking underground, run this
			return drawBlock(heightMapData, chunk, x, heightMapData, z, xCoordinate, zCoordinate);
		}
	}

	function drawMap(chunk) {
		if (!chunk.Renderable) {
			return false;
		}
		console.time("render Chunk");
		var chunkX = chunk.Data[CHUNK_X];
		var chunkZ = chunk.Data[CHUNK_Z];
		var blockList = chunk.Blocks;
		for (var z = 0; z < numberOfBlocksPerAxis; z++) {
			for (var x = 0; x < numberOfBlocksPerAxis; x++) {
				drawPartialChunk(chunk, x, z, chunkX, chunkZ);
			}
		}
		// var text = new PIXI.Text(chunkX + "," + chunkZ, {
		// 	font: "50px Arial",
		// 	fill: "red"
		// });
		// text.position.x = viewPortX - (chunkX * -512);
		// text.position.y = viewPortZ - (chunkZ * -512);
		// textHost.addChild(text);
		console.timeEnd("render Chunk");
	}
	// end functions

	// other
	GUI_ON("ready", function() {
		Draw.stage.addChild(graphics);
		Draw.stage.addChild(textHost);
	});
	worker.addEventListener('message', function(e) {
		if (e.data[OPERATION] === CHUNK_COMPLETE) {
			var chunk = chunks.current[e.data[X_COORDINATE] + "," + e.data[Z_COORDINATE]];
			if (chunk) {
				chunk.HeightMap = new Uint8Array(e.data[HEIGHT_ARRAY]);
				chunk.Blocks = new Uint8Array(e.data[BLOCK_ARRAY]);
				chunk.BlockData = new Uint8Array(e.data[DATA_ARRAY]);
				chunk.Renderable = true;
				drawMap(chunk);
			}
		}
	}, false);
	// end other

	return {
		//return
		get viewPortX() {
			return viewPortX;
		},
		get viewPortY() {
			return viewPortY;
		},
		get viewPortZ() {
			return viewPortZ;
		},
		make: makeChunk,
		draw: drawMap,
		move: moveMap,
		divideScreen: divideScreen
		//end return
	};
});