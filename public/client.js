// here we get a reference to the webpage elements
var divSelectRoom = document.getElementById("selectRoom");
var divConsultingRoom = document.getElementById("consultingRoom");
var inputRoomNumber = document.getElementById("roomNumber");
var btnGoRoom = document.getElementById("goRoom");
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

// These are the global variables
var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;
//these are the STUN servers
var iceServers = {
	'iceServers':[
		{'url':'stun:stun.services.mozilla.com'},
		{'url':'stun:stun.l.google.com:19302'}
	]
}

var streamConstraints = {audio: true, video: true};
var isCaller;


// Here we connect to the socket.io server
var socket = io();

// Click event
btnGoRoom.onclick = function() {
	if (inputRoomNumber.value === '') {
		alert("Please type a room number")
	} else {
		roomNumber = inputRoomNumber.value; // take the value
		socket.emit('create or join', roomNumber); // send msg to server
		divSelectRoom.style = "display: none;"; // hide selectRoom div
		divConsultingRoom.style = "display: block;" // show consultingRoom div
	}
};

// when server emits created
socket.on("created", function(room) {
	// caller gets user media devices with defined constraints
	console.log("created");
	navigator.mediaDevices.getUserMedia(streamConstraints).then((stream) => {
		
		localStream = stream; // sets local stream to variable
		localVideo.srcObject = stream;// shows stream to user
		// localVideo.src = URL.createObjectURL(stream); // @Deprecated: does the same as the above line but doesn't work since mid/late 2018
		isCaller = true; // sets current user as caller
	}).catch((err)=>{
		console.log("An error while accessing media devices");
	});
});

// when server emits joined
socket.on("joined", (room)=>{
	//calee gets user media devices
	navigator.mediaDevices.getUserMedia(streamConstraints).then((stream)=> {
		localStream = stream; // sets local stream to variable
		localVideo.srcObject = stream;// shows stream to user
		// localVideo.src = URL.createObjectURL(stream); // @Deprecated: does the same as the above line but doesn't work since mid/late 2018
	}).catch((err)=> {
		console.log("An errr ocurred when accessing media devices");
	});
});

// when server emits ready
socket.on("ready", () => {
	console.log("ready");
	if (isCaller) {
		// creates on RTCPeerConnection object
		recPeerConnection = new RTCPeerConnection(iceServers);
	
		// adds event listeners to the newly created object
		rtcPeerConnection.onicecandidate = onIceCandidate;
		rtcPeerConnection.onaddstream = onAddStream;
		
		// adds the current local stream to the object
		rtcPeerConnection.addStream(localStream);

		// prepares an Offer
		rtcPeerConnection.createOffer(setLocalAndOffer, (e)=> {console.log(e)});
	}
});

// when server emits offer
socket.on("offer", (event) => {
	console.log("offer");
	if (isCaller) {
		// creates an RTCPeerConnection object
		RTCPeerConnection = new RTCPeerConnection(iceServers);
		
		// adds event listeners to the newly created object
		RTCPeerConnection.onicecandidate = onIceCandidate;
		RTCPeerConnection.onaddstream = onAddStream;

		// ads the current local stream to the object
		rtcPeerConnection.addStream(localStream);

		// stores the offer as remote description
		RTCPeerConnection.setRemoteDescription(new RTCSessionDescription(event));

		// Prepares an Answer
		RTCPeerConnection.createAnswer(setLocalAndAnswer, (e)=>{console.log(e)});
	}
});

//when server emits answer
socket.on("answer", (event) => {
	// stores it as remote description
	RTCPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

// when server emits candidate
socket.on("candidate", (event) => {
	// creates a candidate object
	var candidate = new RTCIceCandidate({
		sdpMLineIndex: event.label,
		candidate: event.candidate
	});
	// stores candidate
	rtcPeerConncection.addIceCandidate(candidate);
});

// when a user receives the other user's video and audio stream
function onAddStream(event) {
	remoteVideo.src = URLcreateObjectURL(event.stream);
	remoteStream = event.stream;
}

// These are the functions referenced before as listeners for the peer connection
// sends a candidate message to server
function onIceCandidate(event) {
	if (event.candidate) {
		console.log("sending ice candidate");
		socket.emit("candidate", {
			type: "cadidate",
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			cadidate: event.candidate.candidate,
			room: roomNumber
		})
	}
}

// stores offer and sends message to server
function setLocalAndOffer(sessionDescription) {
	rtcPeerConnection.setLocalDescription(sessionDescription);
	socket.emit('offer',{
		type:'offer',
		sdp: sessionDescription,
		room: roomNumber
	});
}

// stores answer and sends message to server
function setLocalAndAnswer(sessionDescription) {
	rtcPeerConnection.setLocalDescription(sessionDescription);
	socket.emit('answer', {
		type: 'answer',
		sdp: sessionDescription,
		room: roomNumber
	});
}
