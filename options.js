exports = {
	parse: {
		strict: false,
		filename: process.argv[2]
	},
	compress: {
		sequences: true,
		properties: true,
		dead_code: true,
		drop_debugger: true,
		unsafe: true,
		unsafe_comps: true,
		conditionals: true,
		comparisons: true,
		evaluate: true,
		booleans: true,
		loops: true,
		unused: true,
		hoist_funs: true,
		hoist_vars: false,
		if_return: true,
		join_vars: true,
		cascade: true,
		side_effects: true,
		negate_iife: true,
		screw_ie8: true,

		warnings: true,
		global_defs: {
			// player and control data
			TIMESTAMP: 0,
			LOCALID: 0,
			REMOTEID: 1,
			MOUSE: 2,
			KEYBOARD: 3,
			GAMEPAD: 4,
			PING: 5,
			ACTIVE: 1,
			INACTIVE: 0,
			LEFT_MOUSE: 1,
			MIDDLE_MOUSE: 2,
			RIGHT_MOUSE: 3,
			MOUSE_X: 4,
			MOUSE_Y: 5,
			WHEEL_X: 6,
			WHEEL_Y: 7,

			//controller data
			CROSS: 0,
			CIRCLE: 1,
			TRIANGLE: 2,
			SQUARE: 3,
			LEFT_BUTTON: 4,
			RIGHT_BUTTON: 5,
			LEFT_TRIGGER: 6,
			RIGHT_TRIGGER: 7,
			SELECT: 8,
			START: 9,
			LEFT_ANALOGUE_STICK: 10,
			RIGHT_ANALOGUE_STICK: 11,
			PAD_TOP: 12,
			PAD_BOTTOM: 13,
			PAD_LEFT: 14,
			PAD_RIGHT: 15,

			LEFT_HORIZONTAL: 0,
			LEFT_VERTICAL: 1,
			RIGHT_HORIZONTAL: 2,
			RIGHT_VERTICAL: 3,

			// entity data
			X: 0,
			Y: 1,
			ANGLE: 2,
			WIDTH: 3,
			HEIGHT: 4,
			XSPEED: 5,
			YSPEED: 6,
			TURNSPEED: 7,
			SIDES: 8,

			// audio data
			CHUNKID: 0,
			CHUNKSIZE: 1,
			FORMAT: 2,
			SUBCHUNK1ID: 3,
			SUBCHUNK1SIZE: 4,
			AUDIOFORMAT: 5,
			NUMCHANNELS: 6,
			SAMPLERATE: 7,
			BYTERATE: 8,
			BLOCKALIGN: 9,
			BITSPERSAMPLE: 10,
			SUBCHUNK2ID: 11,
			SUBCHUNK2SIZE: 12,

			// game data
			TURNCW: 0,
			MOVEUP: 1,
			TURNCCW: 2,
			MOVEDOWN: 3,

			// polygon / light.js data
			TRUE: 1,
			FALSE: 0,
			RADIUS: 2,
			READY: 3,
			GLOBAL_VERTICES: 4,
			VERTICES: 5,
			RANGE: 6,
			FALLOFF: 7,
			POLYGON_ID: 8,
			ID: 0,
		}
	},
	output: {
		indent_start: 0,
		indent_level: 4,
		quote_keys: false,
		space_colon: true,
		ascii_only: false,
		inline_script: true,
		width: 80,
		max_line_len: 32000,
		beautify: false,
		source_map: null,
		bracketize: false,
		semicolons: true,
		comments: false,
		preserve_line: false,
		screw_ie8: false
	}
};