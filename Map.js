var Map = Module(function(event) {
	// name: Map
	// targets: Client
	// filenames: Engine

	// variables
	var chunks = {
		current: {},
		old: []
	};
	var chunkHeight = 16;
	var chunkDimention = 16;
	var chunkYAmmount = chunkHeight / chunkDimention;
	var chunkSection = chunkDimention * chunkDimention * chunkDimention;
	var chunkFlatDimention = chunkDimention * chunkDimention;
	var graphics = new PIXI.Graphics();
	var textHost = new PIXI.DisplayObjectContainer();
	var mapOffsetX = 0;
	var mapOffsetY = 0;
	var viewPortX = 0;
	var viewPortY = 0;
	var viewPortZ = 0;
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
			if (viewPortY > chunkDimention - 2) { // always show ground (15) layer
				viewPortY = chunkDimention - 2;
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
		Math.seedrandom("seed" + positionX + positionZ);
		var chunk;
		if (chunks.old.length) {
			recycledChunk = true
			console.time("recycled chunk")
			chunk = chunks.old.pop();
			chunk.Data = LIST_CLEAN(chunk.Data);
			chunk.Biomes;
			chunk.HeightMap;
		} else {
			console.time("chunk")
			var data = LIST_GET(4, INT16);
			var biomes = LIST_GET(chunkFlatDimention, UINT8);
			var height = LIST_GET(chunkFlatDimention, UINT8);
			chunk = {
				Data: data,
				Biomes: biomes,
				HeightMap: height,
				Sections: []
			};
		}
		chunk.Data.set(CHUNK_X, positionX);
		chunk.Data.set(CHUNK_Z, positionZ);
		// Sections
		for (var i = 0; i < chunkYAmmount; i++) {
			if (chunk.Sections[i]) {
				chunk.Sections[i].Blocks;
				chunk.Sections[i].Data = LIST_CLEAN(chunk.Sections[i].Data);
			} else {
				var blocks = LIST_GET(chunkSection, UINT16);
				var data = LIST_GET(chunkSection, UINT8);
				var sectionData = {
					Blocks: blocks,
					Data: data
				};
				chunk.Sections.push(sectionData);
			}
			// var simplex = new SimplexNoise(Math.random);
			for (var z = 0; z < chunkDimention; z++) {
				for (var x = 0; x < chunkDimention; x++) {
					var heightMapSet = false;
					var previousYBlock = 0;
					for (var y = chunkDimention - 1; y > -1; y--) {
						var internalCoordinate = ((y * chunkDimention + z) * chunkDimention + x);
						if (y === 15) {
							var data = 1;
						} else if (y === 8) {
							var data = 1;
						} else if (y < 8 && y > 4) {
							if (previousYBlock > 0) {
								var data = round(getRandomInt(-8, y/2));

								//////////////////////////////////////////////////////////////////////////////////////////
								// split into function call passing previous Y, same level previous block (x-1) //
								// return 0 or blockid                                                          //
								//////////////////////////////////////////////////////////////////////////////////////////
							} else {
								var data = 0;
							}
						} else if (y < 5) {
							var data = 0;
						} else {
							var data = round(getRandomInt(-1, 9));
							// var data = round(simplex.noise3D(x, y, z));
						}
						chunk.Sections[i].Blocks.set(internalCoordinate, data);
						// if (heightMapSet === false && data > 0) {
						// 	heightMapSet = true;
						// 	chunk.HeightMap.set((z * chunkDimention) + x, y);
						// }
						previousYBlock = data;
					}
					for (var y = 0; y < chunkDimention; y++) {
						var internalCoordinate = ((y * chunkDimention + z) * chunkDimention + x);
						// if (y === 15) {
						// 	var data = 1;
						// } else {
						// 	var data = round(getRandomInt(-1, 5));
						// 	// var data = round(simplex.noise3D(x, y, z));
						// }
						var data = chunk.Sections[i].Blocks.get(internalCoordinate);
						if (heightMapSet === false && data > 0) {
							heightMapSet = true;
							chunk.HeightMap.set((z * chunkDimention) + x, y);
						}
					}
				}
			}
		}
		chunks.current[positionX + "," + positionZ] = chunk;
		if (recycledChunk) {
			console.timeEnd("recycled chunk");
		} else {
			console.timeEnd("chunk");
		}
		return chunk;
	}

	function divideScreen() {
		var onScreen = [];
		console.clear();
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

		var width = window.innerWidth;
		var height = window.innerHeight;
		var tileSize = BLOCK_SIZE * chunkDimention;
		var horizontalChunks = Math.ceil(width / tileSize);
		var verticalChunks = Math.ceil(height / tileSize);
		var Xcoordinate = Math.ceil(-viewPortX / tileSize) - 1;
		var chunkTime = 0;
		var mapTime = 0;
		for (var i = -1; i < horizontalChunks + 1; i++) {
			// for (var i = 0; i < 1; i++) {
			var Zcoordinate = Math.ceil(-viewPortZ / tileSize) - 1;
			for (var e = -1; e < verticalChunks + 1; e++) {
				// for (var e = 0; e < 1; e++) {
				onScreen.push(Xcoordinate + "," + Zcoordinate)
				var start1 = performance.now();
				var chunk = makeChunk(Xcoordinate, Zcoordinate);
				chunkTime += performance.now() - start1;
				var start2 = performance.now();
				drawMap(chunk, i, e);
				mapTime += performance.now() - start2;
				Zcoordinate++;
			}
			Xcoordinate++;
		}
		for (var attr in chunks.current) {
			if (onScreen.indexOf(attr) === -1) {
				chunks.old.push(chunks.current[attr]);
				delete chunks.current[attr];
			}
		}
		// console.log(chunkTime, mapTime)

	}

	function color(number) {
		var hex = (15 - number).toString(16);
		var string = hex + hex + hex + hex + hex + hex;
		return parseInt(string, 16);
	}

	function drawMap(chunk, chunkX, chunkZ) {
		console.time("render Chunk");
		for (var i = 0; i < chunk.Sections.length; i++) {
			var blockList = chunk.Sections[i].Blocks;
			for (var z = 0; z < chunkDimention; z++) {
				for (var x = 0; x < chunkDimention; x++) {
					var drawn = false;
					var heightMapData = chunk.HeightMap.get((z * chunkDimention) + x);
					// console.log(viewPortY > heightMapData, viewPortY, heightMapData)
					if (viewPortY > heightMapData) {
						for (var y = viewPortY; y < chunkDimention; y++) {
							var internalCoordinate = ((y * chunkDimention + z) * chunkDimention + x);
							var blockId = blockList.get(internalCoordinate);
							if (!drawn && blockId) {
								drawn = true;
								var style = color(y);
								var block = BLOCK_GET(blockId);
								var xCoordinate = (x * BLOCK_SIZE) + (chunkX * chunkDimention * BLOCK_SIZE) + (viewPortX % 512);
								var yCoordinate = (z * BLOCK_SIZE) + (chunkZ * chunkDimention * BLOCK_SIZE) + (viewPortZ % 512);
								block.drawFn(graphics, xCoordinate, yCoordinate, style, 1);
								y = chunkDimention;
							}
						}
					} else {
						var style = color(heightMapData);
						var internalCoordinate = ((heightMapData * chunkDimention + z) * chunkDimention + x);
						var blockId = blockList.get(internalCoordinate);
						if (blockId) {
							var block = BLOCK_GET(blockId);
							var xCoordinate = (x * BLOCK_SIZE) + (chunkX * chunkDimention * BLOCK_SIZE) + (viewPortX % 512);
							var yCoordinate = (z * BLOCK_SIZE) + (chunkZ * chunkDimention * BLOCK_SIZE) + (viewPortZ % 512);
							block.drawFn(graphics, xCoordinate, yCoordinate, style, 1);
						}
					}
				}
			}
		}
		var text = new PIXI.Text(chunk.Data.get(CHUNK_X) + "," + chunk.Data.get(CHUNK_Z) + "," + chunkX + "," + chunkZ, {
			font: "50px Arial",
			fill: "red"
		});
		text.position.x = (chunkX * chunkDimention * BLOCK_SIZE) + (viewPortX % 512);
		text.position.y = (chunkZ * chunkDimention * BLOCK_SIZE) + (viewPortZ % 512);
		textHost.addChild(text);
		var text = new PIXI.Text("" + viewPortY, {
			font: "50px Arial",
			fill: "blue"
		});
		text.position.x = window.innerWidth / 2;
		text.position.y = window.innerHeight / 2;
		textHost.addChild(text);
		console.timeEnd("render Chunk");
	}
	// end functions

	// other
	GUI_ON("ready", function() {
		Draw.stage.addChild(graphics);
		Draw.stage.addChild(textHost);
	});
	// end other

	return {
		//return
		make: makeChunk,
		draw: drawMap,
		move: moveMap,
		divideScreen: divideScreen
		//end return
	};
});