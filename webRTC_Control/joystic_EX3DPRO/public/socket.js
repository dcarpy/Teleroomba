var socket = io("https://wilson.servebeer.com:3001");

socket.on("data",function(data){
	EX3D.calcuDrive(data.r, data.p);
});

