//SOCKET_URL = 'https://huynhquang.xyz:8080';
SOCKET_URL = 'http://localhost:8080';
getBothMedia = function(){
  NEW_API = (navigator.mediaDevices.getUserMedia !== undefined);
  if(!NEW_API){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    var constraints = {
        audio: true,
        video: true
    };
}
}
  var audioCtx = new AudioContext();
// navigator.getUserMedia(constraints, function(e){}, function(e){
// });
