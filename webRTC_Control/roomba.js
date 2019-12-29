var ip = require('ip');
//var peerPort = 8888;

//HTTPS
var httpsPeerPort = 8001;

var servicePort = 8000;
var servicePortHTTP = 8002;
var express = require('express');
var app = express();


//--------------http-----------------------//

var http = require('http').Server(app);

http.listen(servicePortHTTP, function(){
    console.log("");
    console.log("---------------| Roomba |-----------------");
    console.log("");
    console.log("HTTP Service server open on "+ ip.address() + ":" + servicePortHTTP);
});




//--------------https-----------------------//

var https = require('https');
var fs = require('fs');

var options = {
   key: fs.readFileSync('privkey.pem'),
   cert: fs.readFileSync('cert.pem'),
   requestCert: false,
   rejectUnauthorized: false
 };

  var httpServer = https.createServer(options,app);
  httpServer.listen(servicePort,function(){

    console.log("");
    console.log("---------------| Roomba |-----------------");
    console.log("");
    console.log("HTTPS Service server open on "+ ip.address() + ":" + servicePort);

 });
 

  io = require('socket.io')(httpServer);


  io.on('connection', function (socket) {
  console.log( "socket opened via socket " + socket.id);


  });







//-------------Express----------------------//

app.use(express.static('teleroomba_Android/www'));

app.get('/', function(req, res){
  res.sendFile('teleroomba_Android/www/index.html', {"root": __dirname});
});

app.get('/role', function(req, res){
  res.sendFile('teleroomba_Android/www/route.html', {"root": __dirname});
});

app.get('/360Cam', function(req, res){
  res.sendFile('teleroomba_Android/www/360Cam.html', {"root": __dirname});
});


app.get('/frontCam', function(req, res){
  res.sendFile('teleroomba_Android/www/frontCam.html', {"root": __dirname});
});

app.get('/360', function(req, res){
  res.sendFile('teleroomba_Android/www/360view/index.html', {"root": __dirname});
});

app.get('/test', function(req, res){
  res.sendFile('teleroomba_Android/www/360view/index1.html', {"root": __dirname});
});

app.get('/control2', function(req, res){
  res.sendFile('teleroomba_Android/www/control_model2.html', {"root": __dirname});
});



//-------------Peer.js---------------------//

var PeerServer = require('peer').PeerServer;
//var server = new PeerServer({port: peerPort, allow_discovery: true});
//HTTPS
var server = new PeerServer({port: httpsPeerPort, ssl: options, allow_discovery: true});


server.on('connection', function (id) {
  console.log('new connection with id ' + id);
});

server.on('disconnect', function (id) {
  console.log('disconnect with id ' + id);
});

console.log("");
console.log("----------------| Peer |------------------");
console.log("");
//console.log('peer server running on ' + ip.address() + ':' + peerPort);
//HTTPS
console.log('peer server running on ' + ip.address() + ':' + httpsPeerPort);

