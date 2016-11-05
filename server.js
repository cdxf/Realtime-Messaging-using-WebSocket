var https = require('https');
var fs = require('fs');
var firebase = require("firebase");
var ColorHash = require('color-hash');
var server = function(app){
    var users = {};
    var messages = {};
    var rooms = {};
    var io = null;
    var onlineUsers = {};
    var requestMedia = [];
    var currentStream = [];
    firebase.initializeApp({
        databaseURL: "https://ptudwhcmus.firebaseio.com",
        serviceAccount: "PTUDWHCMUS-33f7faf8ae71.json"
    });
    var db = firebase.database();
    var ref = db.ref('messages');
    var rooms = db.ref('rooms');
    io = require('socket.io')(app);
    videoFilter = [];
    authData = function(data, onResult) {
        token = data.token;
        //  console.log(data);
        auth = firebase.auth();
        auth.verifyIdToken(token).then(function(decodedToken) {
            var uid = decodedToken.sub;
            //console.log(decodedToken);
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
                    uid = socket.user.uid;
                    if (uid in onlineUsers) {
                        onlineUsers[uid].count++;
                    } else {
                        console.log("Them");
                        onlineUsers[uid] = {
                            user: data,
                            count: 1
                        }
                        console.log(onlineUsers);
                    }
                    //console.log("Login " + socket);
                    socket.emit("loginSuccess");
                } else {}
            });
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
        socket.on('getRoomName', function(room) {
            var getRoomName = function(snapshot) {
                roomData = snapshot.val();
                if(roomData.title !== null)
                socket.emit("getRoomName", roomData.title);
            };
            rooms.child(room).once('value', getRoomName);
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
        socket.on('requestOnlineUsers', function() {
            console.log(onlineUsers);
            socket.emit('OnlineUsers', onlineUsers);
        });
        socket.on('requestMedia', function(room) {
            if (!(room in requestMedia))
                requestMedia[room] = [];
            requestMedia[room].push(socket);
        });
        socket.on('requestMediaRecord', function() {
          // this user is not login
          if(socket.user === undefined){
             return;
           }
          // this user is not recording
          if (currentStream[socket.user.uid] === undefined) {
              socket.emit("mediaRecordAccept");
              currentStream[socket.user.uid] = socket;
          }
        });
        socket.on('closeMedia', function(room) {
            if (socket.user !== undefined && currentStream[socket.user.uid] === socket ){
                delete currentStream[socket.user.uid];
                console.log('emit stream end');
                socket.broadcast.emit('videoStreamEnd', socket.user.uid);
                }
            socketIndex = requestMedia[room].indexOf(socket);
            if (socketIndex != -1)
                requestMedia[room].splice(socketIndex, 1);
        });
        socket.on('requestMessages', function(room) {
            var getMessage = function(snapshot) {
                temp = snapshot.val();
                if (temp !== null) {
                    socket.emit('messages', temp);
                } else {
                    socket.emit('messages', {});
                }
            };
            ref.child(room).once('value', getMessage);
        });
        socket.on('videoStream', function(data) {
            //socket.broadcast.emit('videoStream', data);
            room = data.room;
            if (requestMedia[room] === undefined) return;
            requestMedia[room].forEach(function(e, i, a) {
                if (e !== socket)
                    e.emit('videoStream', data);
            });
            // socket.broadcast.emit('videoStream', data);
        });

        socket.on('audioStream', function(data) {
            //if (socket.user === undefined) return;
            room = data.room;
            if (requestMedia[room] === undefined) return;
            requestMedia[room].forEach(function(e, i, a) {
                if (e !== socket)
                    e.emit('audioStream', data);
            });
        });
        socket.on('message', function(data) {
            roomNode = ref.child(data.room);
            roomMeta = rooms.child(data.room);
            //  messages.push(data);
            //console.log(socket.name);
            if (socket.user === undefined) return;
            data.name = socket.user.displayName;
            data.photoURL = socket.user.photoURL;
            colorHash = new ColorHash();
            data.color = colorHash.hex(socket.user.uid);
            roomNode.push(data);
            roomMeta.once('value', function(data) {
                messages_count = data.val().messages_count;
                roomMeta.update({
                    messages_count: messages_count + 1
                });
            });
            io.emit('message', data);
        });
        socket.on('videoStreamEnd',function(){
          if (socket.user !== undefined)
          socket.broadcast.emit('videoStreamEnd', socket.user.uid);
        });
        socket.on('disconnect', function(data) {
            requestMedia.forEach(function(e, i, a) {
                //e = room;
                socketIndex = e.indexOf(socket);
                if (socketIndex != -1)
                    e.splice(socketIndex, 1);
            })
            if (socket.user !== undefined && socket.user.uid in onlineUsers) {
              if (currentStream[socket.user.uid] === socket){
                  delete currentStream[socket.user.uid];
                  socket.broadcast.emit('videoStreamEnd', socket.user.uid);
              }
                onlineUsers[socket.user.uid].count--;
                if (onlineUsers[socket.user.uid].count === 0) {
                    delete onlineUsers[socket.user.uid];
                }
          }
            console.log("Disconnect");
            console.log("A client has disconnect");
        });
    });
}
module.exports = server;