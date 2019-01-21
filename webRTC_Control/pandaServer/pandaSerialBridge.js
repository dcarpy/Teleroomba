const SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('COM6', {
	baudRate: 115200
});
const parser = new Readline({ delimiter: '\r\n'});
port.pipe(parser);

var create = require('create2');

var express = require('express');
var app = express();
var ip = require("ip");

//--------------http-----------------------//
var http = require('http');

//--------------https-----------------------//
var https = require('https');


//--------------File_System---------------//

var fs = require('fs');
const junk = require('junk');

var httpsOptions = {
   key: fs.readFileSync('privkey.pem'),
   cert: fs.readFileSync('cert.pem')
 };


var checkMedia = function(){

  fs.readdir("./public/media", success);

  function success(err,Flist){
    console.log(Flist);
    
    if(err){
      io.emit(err);
      return
    }

    Flist = Flist.filter(junk.not);
    io.emit("returnMD",Flist);
  }


}


//--------------https_End-----------------------//

var io = null;

var useHttps = true;

if(useHttps == false){

  httpServer = http.createServer(app);

  httpServer.listen(3000, function(){
      console.log("");
      console.log("");
      console.log("---------------|  Roomba Testing  |-----------------");
      console.log("");
      console.log("Service server open on http://"+ ip.address() + ":" + 3000);
  });

  io = require('socket.io')(httpServer);
}
else {

  var httpsServer = https.createServer(httpsOptions,app);

  httpsServer.listen(3000,function(){

    console.log("");
    console.log("---------------| Roomba |-----------------");
    console.log("");
    console.log("Service server open on https://"+ ip.address() + ":" + 3000);

  });

  io = require('socket.io')(httpsServer);
}

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', "https://wilson.servebeer.com:8000");
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(express.static('public'));

app.get('/info', function(req, res){
  res.sendFile(__dirname + 'public/info.html');
});

app.get('/localQR', function(req, res){
  res.sendFile(__dirname + 'public/localQR.html');
});


var cmd = {
  cmd : 0,
  buffer1 : 0,
  buffer2 : 0,
};

var startUpSequence = {
    cmdSequence:[
                 {//Enter safe mode
                  cmd : 4,
                  buffer1 : 0,
                  buffer2 : 0
                 },
                 {//Start beep
                  cmd : 2,
                  buffer1 : 1,
                  buffer2 : 2
                 },
                 {//Stop beep
                  cmd : 2,
                  buffer1 : 2,
                  buffer2 : 0
                 },
                 {//Reset camera angle
                  cmd : 5,
                  buffer1 : 0,
                  buffer2 : 0,
                  buffer3 : 90,
                  buffer4 : 128,
                 },
                 {//Standby
                  cmd : 0,
                  buffer1 : 0,
                  buffer2 : 0,
                 },
                ],

    durationSequence:[100,800,100,100,100],
    sequenceDriver: function(step){
            cmd = startUpSequence.cmdSequence[step];
            console.log('\x1b[33m',"[startup sequence" + step + "]>> ",'\x1b[0m',cmd);

            setTimeout(function(){
              if( step < startUpSequence.cmdSequence.length - 1 ){
                startUpSequence.sequenceDriver( step + 1 );
              }else if(step == startUpSequence.cmdSequence.length - 1){
                startupLog();
              }

            },startUpSequence.durationSequence[step]);
    }
}


//-------SerialPort----------//

port.on('open', function() {
	console.log("Serial opened on COM6");
	
	// Fire Startup_Sequence
	setTimeout(function(){
		port.write('ready');
		startUpSequence.sequenceDriver(0);
	}, 1200);
	
});

port.on('data', function(data) {
  //data feed check
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(data);
  //console.log(">> " + data);
  //console.log(cmd.cmd + "," + cmd.buffer1 + "," + cmd.buffer2 + "\n");

  var serialSend = null;

  if( cmd.cmd < 5 ){
    serialSend = (cmd.cmd + "," + cmd.buffer1 + "," + cmd.buffer2);
  } else {
    serialSend = (cmd.cmd + "," + cmd.buffer1 + "," + cmd.buffer2 + ","+ cmd.buffer3 + ","+ cmd.buffer4);
    cmd.cmd -= 5;
    cmd.buffer3 = 0;
    cmd.buffer4 = 0;
  }
  console.log(serialSend);

  port.write(serialSend);

});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});


//---------Socket.io------------//

//var serialReady = true;

io.on('connection', function (socket) {
  console.log( " Teleroomba UI opened via socket " + socket.id);

  patchCMD = function(raw){
      if(cmd.cmd >= 5){
        raw += 5;
        return raw
      }
      else{
        return raw
      }
  }

  socket.on("DR",function(drive){//Drive
    cmd.cmd = patchCMD(1);
    cmd.buffer1 = drive.lV;
    cmd.buffer2 = drive.rV;

  });

  socket.on("BP",function(beep){//Beep
    cmd.cmd = patchCMD(2);
    cmd.buffer1 = beep.act;
    cmd.buffer2 = beep.tp;
    console.log(cmd);
  });

  socket.on("DK",function(){//Dock
    cmd.cmd = patchCMD(3);
    cmd.buffer1 = 0;
    cmd.buffer2 = 0;
    console.log("--CMD: DOCK--");
  });

  socket.on("SM",function(){//Safe_Mode
    cmd.cmd = patchCMD(4);
    cmd.buffer1 = 0;
    cmd.buffer2 = 0;
    //console.log("--CMD: SAFE MODE--");
    //console.log(cmd);
  });

  socket.on("FC",function(camera){//Front_Camera
    if(cmd.cmd<5){
      cmd.cmd += 5;
    }
    cmd.buffer3 = camera.r;
    cmd.buffer4 = camera.p;
    //console.log(cmd);
  });

  socket.on("reqIP",function(){
    io.emit("resIP",ipNport + ":3000");
    console.log("\nIP responded");
  });

  socket.on("checkMD",function(){
    checkMedia();
  });
  

});

//----------log_ip-----------------//
var ipNport = "did not get IP yet";

function GetLocalIPAddr(){ 
console.log("\nlocal IP Address: ", '\x1b[32m');
ipNport = ip.address();
console.log(ipNport);
console.log('\x1b[0m' );
}


//----------open_in_os-------------//

var open = require("open");


//----------startup----------------//
function startupLog(err){
  GetLocalIPAddr();
  if(err){

    if(err == 1){
      console.log('\x1b[31m',"[startup error]>> ",'\x1b[0m',"Check Serial");
    }

    return false
  }
  open("https://teleroomba.itp.io:8000/role");
  console.log('\x1b[33m',"[startup done]>> ",'\x1b[0m',"Everthing's fine, teleroomba is ready to connect :)");
}

