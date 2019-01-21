var socket = io.connect("https://wilson.servebeer.com:3000");

var localSocket = {}

localSocket.sendCmd = function(type,cmd){
	socket.emit(type, cmd);
}

socket.on("returnMD", function(MDList){
	mediaPlayer.mediaList = MDList;
	mediaPlayer.showLocalMediaLS(mediaPlayer.mediaList);
});
