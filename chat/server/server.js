var isHTTPS = false;
var hashIDStorage = {};
var users = {};
var messages = {};
var rooms = {};
var io = null;
var app = null;
var firebase = require("firebase");
var ColorHash = require('color-hash');
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
authData = function(data, onResult) {
    token = data.token;
  //  console.log(data);
    auth = firebase.auth();
    auth.verifyIdToken(token).then(function(decodedToken) {
        var uid = decodedToken.sub;
        console.log(decodedToken);
        onResult(decodedToken);
    }).catch(function(err) {
        console.log(err);
        onResult(false);
    });
}
io.on('connection', function(socket) {
    socket.on('login', function(data) {
        authData(data, function(result) {
            if (result !== false) {
                socket.user = data;
                console.log("Login " + socket);
            } else {}
        })
    })
    socket.on('getRoom', function() {
        var getRoom = function(snapshot) {
            roomData = snapshot.val();
            if (roomData !== null) {
                socket.emit("getRoom", roomData);
            }
        };
        rooms.on('value', getRoom);
    });
    socket.on('createRoom', function(data) {
        var title = data.title;
        var author = data.author;
        json = {
            title: title,
            author: author,
            messages_count: 0
        }
        authData(data, function(result) {
            if (result !== false) {
                rooms.push(json);
                console.log("Room created");
            } else {}
        })

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
        //socket.emit('messages', messages);
    });
    socket.on('requestMessages', function(data) {
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
        roomNode = ref.child(data.room);
        roomMeta = rooms.child(data.room);
        //  messages.push(data);
        console.log(socket.name);
        if (socket.user === undefined) return;
        data.name = socket.user.displayName;
        colorHash = new ColorHash();
        data.color = colorHash.hex(socket.user.uid);
        roomNode.push(data);
        roomMeta.once('value',function(data){
          messages_count = data.val().messages_count;
          roomMeta.update({messages_count: messages_count+1});
        })
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
