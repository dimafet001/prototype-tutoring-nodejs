const express = require("express");
// var http 	  = require('http').Server(app);
var https	  = require("https");

var fs 		  = require("fs");
var session   = require("express-session");
const app	  = express();

// static hosting using express
app.use(express.static("public"));

// Parse URL-encoded bodies (as sent by HTML forms)
// app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// app.set('view engine', 'nunjucs')

// videocall response
app.get('/videocall', (req, res) => {
	// console.log("I get smth")
  	// res.send('hello world')
    res.sendFile(__dirname + '/public/videocall.html');  
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');  
})

app.get('/student', (req, res) => {
    res.sendFile(__dirname + '/public/student.html');  
    // req.session.cookie.isStudent = true;
})

app.get('/teacher', (req, res) => {
    res.sendFile(__dirname + '/public/teacher.html');  
    // req.session.cookie.isStudent = false;
})

app.get('/feed', (req, res) => {
    res.sendFile(__dirname + '/public/feed.html');  
})

app.get('/question', (req, res) => {
    res.sendFile(__dirname + '/public/question.html');  
})

app.get('/materials', (req, res) => {
    res.sendFile(__dirname + '/public/materials.html');  
})

app.post('/ask', (req, res) => {
	console.log("ask")
	console.log(req.body.img);
	console.log(req.body.topic);
	console.log(req.body.desc);
	res.redirect(307, '/feed');
})

var server = https.createServer({
    key: fs.readFileSync(__dirname + '/certs/server.key').toString(),
	cert: fs.readFileSync(__dirname + '/certs/server.crt').toString() 
	}, app)
	.listen(8080, '0.0.0.0', () => {
		console.log("running on 8080");
	});


// app.use(function(request, response){
//   if(!request.secure){
//     response.redirect("https://" + request.headers.host + request.url);
//   }
// });

const io = require("socket.io")(server);
//signaling handlers
io.on("connection", (socket) => {
	console.log("a user connected");

	// when client emits create or join
	socket.on("create or join", (room) => {
		console.log("create or join to room ", room);
		
		// count number of users on room

		var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
		var numClients = myRoom.length;
		console.log(room, 'has before connection ', numClients, 'clients');

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
		console.log("server ready")
		socket.broadcast.to(room).emit("ready");
	});

	socket.on("candidate", (event) => {
		console.log("server candidate")
		socket.broadcast.to(event.room).emit("candidate", event);
    });

	socket.on("offer", (event) => {
		console.log("server offer")
        socket.broadcast.to(event.room).emit("offer", event.sdp);
    });

	socket.on("answer", (event) => {
		console.log("server answer")
		socket.broadcast.to(event.room).emit("answer", event.sdp);
    });

});