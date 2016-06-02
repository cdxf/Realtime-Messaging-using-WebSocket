//SOCKET_URL = 'https://huynhquang.xyz:8080';
SOCKET_URL = 'http://localhost:8080';
NEW_API = (navigator.mediaDevices.getUserMedia !== undefined);
if(!NEW_API){
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  var constraints = {
      audio: true,
      video: true
  };
navigator.getUserMedia(constraints, function(e){}, function(e){
});
}
