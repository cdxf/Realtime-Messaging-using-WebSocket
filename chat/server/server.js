var isHTTPS = false;
//var hashIDStorage = {};
var users = {};
var messages = {};
var rooms = {};
var io = null;
var app = null;
var firebase = require("firebase");
firebase.initializeApp({
    databaseURL: "https://ptudwhcmus.firebaseio.com",
    serviceAccount: "PTUDWHCMUS-33f7faf8ae71.json"
});
var db = firebase.database();
var ref = db.ref('messages');
var rooms = db.ref('rooms');
var getMessage = function(snapshot) {
    temp = snapshot.val();
    if (temp !== null) {
        messages = temp;
    }
};
ref.on('value', getMessage);
if (isHTTPS === true) {
    var https = require('https');
    var fs = require('fs');
    var options = {
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('cert.pem'),
        ca: fs.readFileSync('chain.pem')
    };
    app = https.createServer(options);
    io = require('socket.io').listen(app);
    app.listen(8080);
} else {
    io = require('socket.io')(8080);
}
videoFilter = [];
io.on('connection', function(socket) {
    socket.on('login', function(data) {
        token = data.token;
        auth = firebase.auth();
        auth.verifyIdToken(token).then(function(decodedToken) {
            var uid = decodedToken.sub;
        });
    })
    socket.on('createRoom', function(data) {

    });
    socket.on('hashID', function(hashID) {
        console.log("Hash ID " + hashID);
        socket.hashID = hashID;
        if (videoFilter[hashID] === undefined) {
            videoFilter[hashID] = socket;
            console.log("Added " + hashID);
        }
        if (hashIDStorage[hashID] !== undefined) {
            hashIDStorage[hashID]++;
        } else {
            hashIDStorage[hashID] = 1;
            socket.broadcast.emit('newClient');
        }
        count = Object.keys(hashIDStorage).length;
        socket.emit('numberGuest', count);
        socket.emit('messages', messages);
    });
    socket.on('numberGuest', function(data) {

    });
    socket.on('videoStream', function(data) {
        if (videoFilter[socket.hashID] == socket) {
            socket.broadcast.emit('videoStream', data);
        }
    });

    socket.on('audioStream', function(data) {
        if (videoFilter[socket.hashID] == socket) {
            socket.broadcast.emit('audioStream', data);
        }
    });

    socket.on('videoInfo', function(data) {
        socket.broadcast.emit('videoInfo', data);
    });

    socket.on('message', function(data) {
        //  messages.push(data);
        ref.push(data);
        io.emit('message', data);
    });
    socket.on('disconnect', function(data) {
        console.log("Disconnect");
        hashID = socket.hashID;
        delete videoFilter[hashID];
        console.log("A client has disconnect");
        hashIDStorage[hashID]--;
        if (hashIDStorage[socket.hashID] === 0) {
            delete hashIDStorage[hashID];
        }
        if (hashIDStorage[hashID] === undefined) {
            io.emit('closedClient', {
                'hashID': hashID
            });
        }
    });
});
