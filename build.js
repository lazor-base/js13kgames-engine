// name: build

// variables
var UglifyJS = require("uglify-js");
var fs = require("fs");
var options = require("./options.js");

var Q = [];
var result;
// end variables

// functions
for (i = 1000; --i; i - 10 && i - 13 && i - 34 && i - 39 && i - 92 && Q.push(String.fromCharCode(i)));
var Minify = function(code, s) {
	i = s = code.replace(/([\r\n]|^)\s*\/\/.*|[\r\n]+\s*/g, '').replace(/\\/g, '\\\\'), X = B = s.length / 2, O = m = '';
	for (S = encodeURI(i).replace(/%../g, 'i').length;; m = c + m) {
		for (M = N = e = c = 0, i = Q.length; !c && --i; !~s.indexOf(Q[i]) && (c = Q[i]));
		if (!c) break;
		if (O) {
			o = {};
			for (x in O) for (j = s.indexOf(x), o[x] = 0;~j; o[x]++) j = s.indexOf(x, j + x.length);
			O = o;
		} else for (O = o = {}, t = 1; X; t++) for (X = i = 0; ++i < s.length - t;) if (!o[x = s.substr(j = i, t)]) if (~ (j = s.indexOf(x, j + t))) for (X = t, o[x] = 1;~j; o[x]++) j = s.indexOf(x, j + t);
		for (x in O) {
			j = encodeURI(x).replace(/%../g, 'i').length;
			if (j = (R = O[x]) * j - j - (R + 1) * encodeURI(c).replace(/%../g, 'i').length)(j > M || j == M && R > N) && (M = j, N = R, e = x);
			if (j < 1) delete O[x]
		}
		o = {};
		for (x in O) o[x.split(e).join(c)] = 1;
		O = o;
		if (!e) break;
		s = s.split(e).join(c) + c + e
	}
	c = s.split('"').length < s.split("'").length ? (B = '"', /"/g) : (B = "'", /'/g);
	i = result = '_=' + B + s.replace(c, '\\' + B) + B + ';for(Y in $=' + B + m + B + ')with(_.split($[Y]))_=join(pop());eval(_)';
	i = encodeURI(i).replace(/%../g, 'i').length;
	console.log(S + 'B to ' + i + 'B (' + (i = i - S) + 'B, ' + ((i / S * 1e4 | 0) / 100) + '%)');
	return result;
};

var default_options = {};
// Create copies of the options
var getUTF8Size = function(str) {
	var sizeInBytes = str.split('')
		.map(function(ch) {
		return ch.charCodeAt(0);
	}).map(function(uchar) {
		// The reason for this is explained later in
		// the section “An Aside on Text Encodings”
		return uchar < 128 ? 1 : 2;
	}).reduce(function(curr, next) {
		return curr + next;
	});

	return sizeInBytes;
};

with(UglifyJS) {
	fs.exists("build/", function(bool) {
		if (bool) {
			var parse_options = defaults({}, options.parse);
			var compress_options = defaults({}, options.compress);
			var output_options = defaults({}, options.output);

			// parse_options = defaults(parse_options, default_options.parse, true);
			// compress_options = defaults(compress_options, default_options.compress, true);
			// output_options = defaults(output_options, default_options.output, true);

			// 1. Parse
			var fullCode = fs.readFileSync(process.argv[2], "utf8");
			var toplevel_ast = parse(fullCode, parse_options);
			toplevel_ast.figure_out_scope();

			// 2. Compress
			var compressor = new Compressor(compress_options);
			var compressed_ast = toplevel_ast.transform(compressor);

			// 3. Mangle
			compressed_ast.figure_out_scope();
			compressed_ast.compute_char_frequency();
			compressed_ast.mangle_names();

			// 4. Generate output
			var uglifiedCode = compressed_ast.print_to_string(output_options);
			var oldSize = getUTF8Size(fullCode);
			var newSize = getUTF8Size(uglifiedCode);
			var saved = ((1 - newSize / oldSize) * 100).toFixed(2);
			console.log("saved " + saved + " % old size: " + oldSize + "B new size: " + newSize + "B");
			// var minifiedCode = Minify(uglifiedCode);

			var location, split;
			if (process.argv[3].indexOf("ClientServer") > -1) {
				split = "ClientServer";
				location = "client-server";
			} else if (process.argv[3].indexOf("Server") > -1) {
				split = "Server";
				location = "server";
			} else if (process.argv[3].indexOf("Client") > -1) {
				split = "Client";
				location = "client";
			} else {
				split = "";
				location = "server";
			}
			var name = process.argv[3].split(split).join("");
			fs.writeFile('build/' + location + "/" + name, uglifiedCode, function(err) {
				if (err) throw err;
				console.log('Saved to build/' + process.argv[3]);
			});
		} else {
			console.error("Wrong build location.")
		}
	});
}
// end functions

// other
// end other

// return
// end return
