var express = require('express')
var app = express()
var ip = require('ip')

var create = require('create2')
let robot; const run = 1
const drRun = 0
const drAngle = 0
const angle = 0

// --------------https-----------------------//
var https = require('https')

// --------------File_System---------------//

var fs = require('fs')
const junk = require('junk')

var httpsOptions = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')
}

var checkMedia = function () {
  fs.readdir('./public/media', success)

  function success (err, Flist) {
    console.log(Flist)

    if (err) {
      io.emit(err)
      return
    }

    Flist = Flist.filter(junk.not)
    io.emit('returnMD', Flist)
  }
}

// --------------https_End-----------------------//

var io = null

var httpsServer = https.createServer(httpsOptions, app)

httpsServer.listen(3000, function () {
  console.log('')
  console.log('---------------| Roomba |-----------------')
  console.log('')
  console.log('Service server open on https://' + ip.address() + ':' + 3000)
})

io = require('socket.io')(httpsServer)

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', 'https://sharkhead-uav.com:8000')
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)

  // Pass to next layer of middleware
  next()
})

app.use(express.static('public'))

app.get('/info', function (req, res) {
  res.sendFile(__dirname + 'public/info.html')
})

app.get('/localQR', function (req, res) {
  res.sendFile(__dirname + 'public/localQR.html')
})

var cmd = {
  cmd: 0,
  buffer1: 0,
  buffer2: 0
}

// -------SerialPort----------//

function start () {
  create.open('/dev/ttyUSB0', main)
}

// Main program

function main (r) {
  r.start()
  //r.safe()
  robot = r

  robot.setSong(0, [
    [72, 32],
    [76, 32],
    [79, 32],
    [72, 32]
  ])

  robot.setSong(1, [
    [59, 64],
    [62, 32],
    [69, 96],
    [67, 64],
    [62, 32],
    [60, 96],
    [59, 64],
    [59, 32],
    [59, 32],
    [60, 32],
    [62, 32],
    [64, 96],
    [62, 96]
  ])
}

function handleCmd (c) {
  if (c.cmd == 1) {
    robot.drivePower(c.buffer1 * 10, c.buffer2 * 10)
  } else if (c.cmd == 2) {
    robot.play(1)
  } else if (c.cmd == 3) {
    robot.autoDock()
  } else if (c.cmd == 4) {
    robot.safe()
  }
  console.log('cmd = ' + c.cmd)
}

// ---------Socket.io------------//

io.on('connection', function (socket) {
  console.log(' Teleroomba UI opened via socket ' + socket.id)

  const patchCMD = function (raw) {
    if (cmd.cmd >= 5) {
      raw += 5
      return raw
    } else {
      return raw
    }
  }

  socket.on('DR', function (drive) { // Drive
    cmd.cmd = patchCMD(1)
    cmd.buffer1 = drive.lV
    cmd.buffer2 = drive.rV
    handleCmd(cmd)
  })

  socket.on('BP', function (beep) { // Beep
    cmd.cmd = patchCMD(2)
    cmd.buffer1 = beep.act
    cmd.buffer2 = beep.tp
    handleCmd(cmd)
  })

  socket.on('DK', function () { // Dock
    cmd.cmd = patchCMD(3)
    cmd.buffer1 = 0
    cmd.buffer2 = 0
    console.log('--CMD: DOCK--')
    handleCmd(cmd)
  })

  socket.on('SM', function () { // Safe_Mode
    cmd.cmd = patchCMD(4)
    cmd.buffer1 = 0
    cmd.buffer2 = 0
    console.log('--CMD: SAFE MODE--')
    handleCmd(cmd)
  })

  socket.on('FC', function (camera) { // Front_Camera
    if (cmd.cmd < 5) {
      cmd.cmd += 5
    }
    cmd.buffer3 = camera.r
    cmd.buffer4 = camera.p
  })

  socket.on('reqIP', function () {
    io.emit('resIP', ipNport + ':3000')
    console.log('\nIP responded')
  })

  socket.on('checkMD', function () {
    checkMedia()
  })
})

// ----------log_ip-----------------//
var ipNport = 'did not get IP yet'

function GetLocalIPAddr () {
  console.log('\nlocal IP Address: ', '\x1b[32m')
  ipNport = ip.address()
  console.log(ipNport)
  console.log('\x1b[0m')
}

// ----------open_in_os-------------//

var open = require('open')

// ----------startup----------------//
function startupLog (err) {
  GetLocalIPAddr()
  if (err) {
    if (err == 1) {
      console.log('\x1b[31m', '[startup error]>> ', '\x1b[0m', 'Check Serial')
    }

    return false
  }
  open('https://sharkhead-uav.com:8000/role')
  console.log('\x1b[33m', '[startup done]>> ', '\x1b[0m', "Everthing's fine, teleroomba is ready to connect :)")
}

start()
