var Server = Module(function(event) {
	var serverSocket;

	function start() {
		process.chdir("server");
		var url = require('url');
		var path = require('path');
		var app = require('http').createServer(handler);
		var io = require('socket.io').listen(app);
		var fs = require('fs');
		var mimeTypes = {
			"html": "text/html",
			"jpeg": "image/jpeg",
			"jpg": "image/jpeg",
			"png": "image/png",
			"js": "text/javascript",
			"css": "text/css"
		};
		io.set('log level', 1); // reduce logging

		app.listen(80, "0.0.0.0");


		function handler(req, res) {
			var uri = url.parse(req.url).pathname;
			var filename = path.join(process.cwd(), uri);
			fs.exists(filename, function(exists) {
				if (!exists) {
					console.log("not exists: " + filename);
					res.writeHead(404, {
						'Content-Type': 'text/plain'
					});
					// res.write('404 Not Found\n');
					res.end();
					return;
				}
				var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
				res.writeHead(200, {
					'Content-Type': mimeType
				});

				var fileStream = fs.createReadStream(filename);
				fileStream.pipe(res);

			});
		}
		io.sockets.on('connection', function(socket) {
			event.emit("connection", socket);
			initServer(socket);
		});
	}

	function connect(ip) {
		serverSocket = io.connect(ip);
		Server.remote = serverSocket;
		initServer(serverSocket);
	}

	function initServer(socket) {
		console.log(socket)
		socket.on("message", Message.dock);
	}

	function removePlayerById(playerIds, socket) {
		io.sockets.emit("disconnects", playerIds, Date.now());
		tanks.remove(playerIds, function(remoteId) {
			socket.get("clientList", function(err, idList) {
				if (idList && idList.length) {
					helper.removeFromArray(idList, remoteId);
					socket.set("clientList", idList);
				}
			});
		});
		console.log("total players", tanks.length);
	}

	function onPlayerDisconnect(socket) {
		console.log("Client Disconnected")
		socket.get("clientList", function(err, playerIds) {
			console.log(playerIds)
			removePlayerById(playerIds, socket);
			socket.get("socketId", function(err, index) {
				helper.removeFromArrayAtIndex(sockets, index);
			});
		});
	}

	function send(messageString, target) {
		target.emit(messageString);
	}


	return {
		send: send,
		remote:null,
		connect: connect,
		on: event.on,
		emit: event.emit,
		start: start
	};
});
if (typeof module !== "undefined") {
	module.exports = Server;
}