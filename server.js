const express = require("express");
const app = express();
const fs = require("fs"); // file system core module
var https = require('https');
var io = require("socket.io")(https);

// static hosting using express
app.use(express.static("public"));

//signaling handlers
io.on("connection", (socket) => {
	console.log("a user connected");

	// when client emits create or join
	socket.on("create or join", (room) => {
		console.log("create or join to room ", room);
		
		// count number of users on room

		var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
		var numClients = myRoom.length;
		console.log(room, 'has', numClients, 'clients');

		if (numClients == 0) {
			socket.join(room);
			socket.emit("created", room);
		} else if (numClients == 1) {
			socket.join(room);
			socket.emit("joined", room);
		} else {
			socket.emit("full", room);
		}
	});

	// relay only handlers
	socket.on("ready", (room) => {
		socket.broadcast.to(room).emit("ready"); 
	});

	socket.on("candidate", (event) => {
                socket.broadcast.to(event.room).emit("candidate", event);
        });

	socket.on("offer", (event) => {
                socket.broadcast.to(event.room).emit("offer", event.sdp);
        });

	socket.on("answer", (event) => {
                socket.broadcast.to(event.room).emit("answer", event.sdp);
        });

});

var webServer = https.createServer({
    key:  fs.readFileSync(__dirname + "/certs/localhost.key"),
    cert: fs.readFileSync(__dirname + "/certs/localhost.crt")
}, app);

app.get('/', function(request, response){
    response.sendfile('index.html');
});

// listener
// http.listen(8080, function() {
webServer.listen(8080, "192.168.43.71", function() {
	console.log("listening on *:8080");
});
