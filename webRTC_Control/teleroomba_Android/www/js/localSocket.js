//var socket = io.connect("https://sharkhead-uav.com:3000");
var socket = io.connect("https://wilson.sharkhead-uav.com:3000");

var localSocket = {}

localSocket.sendCmd = function(type,cmd){
	socket.emit(type, cmd);
}

socket.on("returnMD", function(MDList){
	mediaPlayer.mediaList = MDList;
	mediaPlayer.showLocalMediaLS(mediaPlayer.mediaList);
});
