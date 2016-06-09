angular.module('app')
    .controller('MainCtrl', ['$scope', 'chatService', function($scope, chatService) {
    }])
    .directive('chat', ['$interval','$stateParams', 'fire','chatService', function($interval,$stateParams, fire,chatService) {
        return {
            restrict: 'E',
            scope: {
                api: '=',
            },
            templateUrl: 'template/chatDirective.html',
            link: function(scope, element, attrs) {
              scope.isLogged = fire.isLogged();
              scope.room = $stateParams.id;
              scope.uid = 0;
              scope.roomName = "";
              chatService.getRoomName(scope.room,function(roomName){
                scope.roomName = roomName;
              });
              var startedMedia = false;
              if(scope.isLogged === true){
                chatService.requestMediaRecord();
                onMediaRecordAccept = chatService.scope.$on('mediaRecordAccept',function(){
                  scope.accepted = true;
                  scope.$apply();
                  getBothMedia();
                  camera(scope, element, chatService);
                  audioRecord(scope, chatService);
                  startedMedia = true;
                });
              }
              onauthChanged =  fire.scope.$on('authChanged', function(e, data) {
                  scope.isLogged = fire.isLogged();
                  if (data !== undefined) {
                      scope.$apply();
                      scope.uid = data.uid;
                      scope.photoURL = data.photoURL;
                      if(!startedMedia){
                        chatService.requestMediaRecord();
                        onMediaRecordAccept = chatService.scope.$on('mediaRecordAccept',function(){
                          scope.accepted = true;
                          scope.$apply();
                          getBothMedia();
                          camera(scope, element, chatService);
                          audioRecord(scope, chatService);
                        });
                      }
                  }
                  else{
                    recordStop();
                  }
                  if (scope.isLogged === true) scope.$apply();
              });
                serviceEvent = chatService.scope;
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                var isSending = false;
                scope.message = "";
                scope.sound = false;
                scope.videosID = [];
                var ontype = false;
                var colors = [];
                scope.onSound = function() {
                    scope.sound = true;
                };
                scope.offSound = function() {
                    scope.sound = false;
                };
                var ended = false;
                onMesssages = serviceEvent.$on('messages', function(e, data) {
                    html = $(".chatbox ul", element);
                    html.text("");
                    messages = data.messages;
                    for(var roomID in messages){
                      add(messages[roomID]);
                    }
                    ended = true;
                });
                chatService.requestMessages(scope.room);
                chatService.requestMedia(scope.room);
                onMesssage = serviceEvent.$on('message', function(e, data) {
                    if(data.room != scope.room) return;
                    if (ended && scope.sound) {
                        $("#notifysound", element)[0].volume = 0.5;
                        $("#notifysound", element)[0].play();
                    }
                    add(data);
                    scope.onSound();
                });
                onVideoStreamEnd = serviceEvent.$on('videoStreamEnd', function(e, uid) {
                  console.log("stream end",uid);
                  index =  scope.videosID.indexOf(uid);
                  if (index != -1)
                      scope.videosID.splice(index, 1);
                      scope.$apply();
                });
                oldSource = null;
                onAudioStream = serviceEvent.$on('audioStream', function(e, data) {
                    if(audioCtx === undefined){
                        audioCtx = new AudioContext();
                    }
                    if (oldSource !== null) stopAudio(oldSource);
                    oldSource = startAudio(audioCtx, data.data, data.time, data.length, data.sampleRate);
                });
                onVideoStream = serviceEvent.$on('videoStream', function(e, data) {
                    console.log("received");
                    uid = data.uid;
                    room = data.room;
                    photoURL = data.photoURL;
                    ratio = data.ratio;
                    videoHeight = 200;
                    if(room != scope.room) return;
                    if (!scope.videosID.includes(data.uid)) {
                        scope.videosID.push(data.uid);
                        scope.$apply();
                    }
                    blob = new Blob([data.data], {
                        type: 'video/webm'
                    });
                    ratio = data.ratio;
                    capture = $("#video_" + uid)[0];
                    var canvas = $('#canvas_' + uid)[0];
                    var photo = $('#photo_' + uid)[0];
                    photo.src = photoURL;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(capture, 0, 0, ratio * videoHeight, videoHeight);
                    setTimeout(function(){
                      capture.src = window.URL.createObjectURL(blob);
                      capture.load();
                      capture.play();
                    },1);

                    console.log("play");

                    if (canvas.height != videoHeight) {
                        canvas.width = capture.width = videoHeight * ratio;
                        canvas.height = capture.height = videoHeight;
                    }
                    // capture.addEventListener('play', function() {
                    //     var $this = this; //cache;
                    // }, 0);
                });
                scope.enter = function($event) {
                    if ($event.keyCode == 13) {
                        scope.send();
                    }
                };
                scope.$on('$destroy',function(){
                    onMesssages();
                    onMesssage();
                    onAudioStream();
                    onVideoStream();
                    onauthChanged();
                    onMediaRecordAccept();
                    onVideoStreamEnd();
                    chatService.closeMedia(scope.room);
                    recordStop();
                });
                scope.send = function() {
                    scope.offSound();
                    if (isSending) return;
                    var imageInput = $("#picture", element);
                    var fileNumber = imageInput[0].files.length;
                    if ((scope.message === "" && fileNumber === 0)) return;
                    var time = Date.now();
                    var image = "";
                    var completed = true;
                    isSending = true;
                    if (fileNumber >= 1) {
                        completed = false;
                        file = imageInput[0].files[0];
                        reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.addEventListener("load", function() {
                            image = reader.result;
                            completed = true;
                        }, false);
                    }
                    if (colors[name] === undefined) colors[name] = getRandomColor();
                    id = setInterval(function() {
                        if (completed) {
                            json = {
                                room: scope.room,
                                message: escapeHtml(scope.message),
                                time: time,
                                color: colors[name],
                                image: image
                            };
                            chatService.sendMessage(json);
                            //conn.send(JSON.stringify());
                            isSending = false;
                            scope.message = "";
                            imageInput.val(null);
                            clearInterval(id);
                        }
                    }, 50);

                };
                scrollToBottom = function() {
                    chatbox = $(".chatbox", element);
                    chatbox[0].scrollTop = chatbox[0].scrollHeight;
                };
                addMessage = function(message) {
                    var contents = `<li class=\"notify\">${message}</li>`;
                    html = $(".chatbox ul", element);
                    html.append(contents);
                    //html.html(html.html() + contents) ;
                    scrollToBottom();
                };
                add = function(data) {
                  name = data.name;
                  message = data.message;
                  time = data.time;
                  color = data.color;
                  image = data.image;
                  photoURL = data.photoURL;
                    _time = new Date();
                    _time.setTime(time);
                    timeString = _time.getHours() + ':' + _time.getMinutes();
                    var contents = `
                    <li>
                    <table>
                    <tr>
                    <td><img class="photoURL" src="${photoURL}" alt="photoURL" /><td>
                    <td>
                    <span class="username" style="color:${color}">${name}</span> <span class="time">${timeString}</span>
                    <div><span class="message">${message}</span>
                    </div><td>
                    </tr>
                    </li>
                    `;
                    html = $(".chatbox ul", element);
                    html.append(contents);
                    if (ytVidId(message) !== false) {
                        contents = `
                        <li>
                        <iframe class="thumbail" width="560" height="315" src="https://www.youtube.com/embed/${ytVidId(message)}" frameborder="0" allowfullscreen></iframe>
                        </li>
                        `;
                        html.append(contents);
                    } else {
                      //  console.log(message);
                    }
                    if (image !== "" && image !== undefined) {
                        contents = `<li><img class="thumbail" src="${image}"/></li>`;
                        html.append(contents);
                    }

                    scrollToBottom();
                };
                //Send camera here
                //Handle Camera
            }
        };
    }])
var gvideotrack;
var gsoundtrack;
function recordStop(){
    if(gvideotrack !== undefined)
    gvideotrack.stop();
    if(gsoundtrack !== undefined)
    gsoundtrack.stop();
    }
function audioRecord(scope, service) {
    var constraints = {
        audio: true
    };
    onStream = function(mediaStream){
      gsoundtrack = mediaStream.getTracks()[0];
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      var audioCtx = new AudioContext();
      var chunk = [];
      window.source = audioCtx.createMediaStreamSource(mediaStream);
      window.gain = audioCtx.createGain();
      gain.gain.value = 1;
      window.dest = audioCtx.createMediaStreamDestination();
      window.processor = audioCtx.createScriptProcessor(8192, 1, 1);
      var n = 10;
      var c = 0;
      var buffer = new Float32Array(8192 * n);
      processor.onaudioprocess = function(audioProcessingEvent) {
          // The input buffer is the song we loaded earlier
          var inputBuffer = audioProcessingEvent.inputBuffer;
          // The output buffer contains the samples that will be modified and played
          var outputBuffer = audioProcessingEvent.outputBuffer;
          // Loop through the output channels (in this case there is only one)
          var inputData = inputBuffer.getChannelData(0);
          var outputData = outputBuffer.getChannelData(0);
          // Loop through the 8192 samples
          for (var sample = 0; sample < inputBuffer.length; sample++) {
              // make output equal to the same as the input
              buffer[c * 8192 + sample] = inputData[sample];
              // Math.random() is in [0; 1.0]
              // audio needs to be in [-1.0; 1.0]
          }
          c++;
          if (c == n) {
              json = {
                  'uid': scope.uid,
                  'room': scope.room,
                  'length': 8192 * n,
                  'data': buffer.buffer,
                  'time': audioCtx.currentTime,
                  'sampleRate': inputBuffer.sampleRate
              };
              c = 0;
              service.sendAudioStream(json);
          }

          //var bufferNode = audioCtx.createBufferSource();
          //window.source.connect(audioCtx.destination);

          // start the source playing
          //bufferNode.start();
      };
      source.connect(gain);
      gain.connect(processor);
      processor.connect(dest);
    };
    onError = function(err){
      console.log(err.name);
    };
    if(NEW_API){
      navigator.mediaDevices.getUserMedia(constraints)
          .then(onStream)
          .catch(onError);
    }else{
      navigator.getUserMedia(constraints, onStream, onError);
    }

}
function camera(scope, element, service) {
    console.log('start camera');
    cameraElem = $("#mycamera", element).get(0);
    cameraElem.volume = 0;
    var options = {
        videoBitsPerSecond: 200000,
        mimeType: 'video/webm',
    };
    var constraints = {
        video: {
            mandatory: {
                maxWidth: 200,
                maxHeight: 200
            }
        }
    };
    onStream = function(mediaStream) {
        gvideotrack = mediaStream.getTracks()[0];
        scope.hasCamera = true;
        scope.$apply();
        chunk = [];
        var mediaRecorder = new MediaRecorder(mediaStream, options);
        mediaRecorder.start();
        mediaRecorder.ondataavailable = function(e) {
            chunk.push(e.data);
        };
        var record = function() {
            var blob = new Blob(chunk, {
                type: 'video/webm'
            });
            //blob to json
            var reader = new FileReader();
            reader.onloadend = function() {
                arrayBuffer = this.result;
                json = {
                    room: scope.room,
                    uid: scope.uid,
                    photoURL: scope.photoURL,
                    data: arrayBuffer,
                    ratio: cameraElem.videoWidth / cameraElem.videoHeight
                };
                console.log("send");
                service.sendVideoStream(json);
            };
            reader.readAsArrayBuffer(blob);
            mediaRecorder.stop();
            chunk = [];
            mediaRecorder.start();
        };
        setInterval(function() {
            record();
        }, 500);
        cameraElem.src = window.URL.createObjectURL(mediaStream);
        cameraElem.onloadedmetadata = function(e) {
            cameraElem.play();
        };
    };
    onError = function(err) {
        scope.hasCamera = false;
        console.log("Camera Error" + err.name);
    };
    if (NEW_API) {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(onStream)
            .catch(onError);
    } else {
      navigator.getUserMedia(constraints, onStream, onError);
    }
}
