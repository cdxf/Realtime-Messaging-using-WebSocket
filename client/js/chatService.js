angular.module('app')
.service('chatService', function($interval, $rootScope) {
    var scope = this.scope = $rootScope.$new(true);
    var conn = io(SOCKET_URL);
    this.user = "";
    this.rooms = {};
    //var conn = new WebSocket('wss://huynhquang.xyz/wss2/NNN');
    //var conn = new WebSocket('ws://localhost:8080');
    var ended = false;
    conn.on('connect', function(data) {
        console.log("Connection established!");
        conn.emit('hashID', localStorage.getItem('hashID'));
    });
    conn.on('numberGuest', function(data) {
        this.numberGuest = data;
        scope.$emit('numberGuestChange', {
            type: 'current',
            'n': this.numberGuest
        });
    });
    conn.on('numberConnection', function(data) {
        this.numberConnection = data;
        scope.$emit('numberConnection', data);
    });
    conn.on('closedClient', function(data) {
        this.numberGuest--;
        scope.$emit('numberGuestChange', {
            type: 'closed',
            'n': this.numberGuest
        });
        scope.$emit('guestLeave', {
            'hashID': data.hashID
        });
    });
    conn.on('newClient', function(data) {
        this.numberGuest++;
        scope.$emit('numberGuestChange', {
            type: 'join',
            'n': this.numberGuest
        });
    });
    conn.on('messages', function(data) {
        scope.$emit('messages', {
            messages: data
        });
    });
    conn.on('message', function(data) {
        scope.$emit('message', data);
    });
    conn.on('OnlineUsers', function(data) {
        scope.$emit('OnlineUsers', data);
    });
    conn.on('videoStream', function(data) {
        scope.$emit('videoStream', data);
    });
    conn.on('audioStream', function(data) {
        scope.$emit('audioStream', data);
    });
    conn.on('videoStreamEnd', function(uid) {
        scope.$emit('videoStreamEnd', uid);
    });

    conn.on('mediaRecordAccept', function(data) {
        scope.$emit('mediaRecordAccept', data);
    });
    conn.on('loginSuccess', function(data) {
        scope.$emit('loginSuccess', data);
    });
    this.sendMessage = function(json) {
        conn.emit("message", json);
    };
    this.sendVideoStream = function(json) {
        conn.emit("videoStream", json);
    };
    this.sendAudioStream = function(json) {
        conn.emit("audioStream", json);
    };
    this.login = function(data){
      this.user = data;
      conn.emit("login", data);
    }
    this.createRoom = function(data){
      conn.emit("createRoom", data);
    }
    this.requestMessages = function(room){
      conn.emit("requestMessages",room);
    }
    this.videoStreamEnd = function(){
      conn.emit("videoStreamEnd");
    }
    this.requestMediaRecord = function(){
      console.log("requestMediaRecord");
      conn.emit("requestMediaRecord");
    }

    this.requestOnlineUsers = function(){
      conn.emit("requestOnlineUsers");
    }
    this.requestMedia = function(room){
      console.log("requestMedia");
      conn.emit("requestMedia",room);
    }
    this.closeMedia = function(room){
      conn.emit("closeMedia",room);
    };
    this.getRoomName = function(room,onResult){
      conn.emit("getRoomName",room);
      conn.once('getRoomName', function(data) {
          onResult(data);
      });
    }
    this.getRoom = function(onResult){
      conn.emit("getRoom");
      conn.on('getRoom', function(data) {
          onResult(data);
      });
    }
});
