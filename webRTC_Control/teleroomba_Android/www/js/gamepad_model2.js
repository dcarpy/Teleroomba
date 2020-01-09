// ------ Gamepad Control ---------//

var haveEvents = 'ongamepadconnected' in window
var controllers = {}

function connecthandler (e) {
  console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length)
  addgamepad(e.gamepad)
}

function addgamepad (gamepad) {
  controllers[gamepad.index] = gamepad
  requestAnimationFrame(updateStatus)
}

function disconnecthandler (e) {
  removegamepad(e.gamepad)
}

function removegamepad (gamepad) {
  delete controllers[gamepad.index]
}

function updateStatus () {
  if (!haveEvents) {
    scangamepads()
  }

  var i = 0
  var j

  for (j in controllers) {
    var controller = controllers[j]

    for (i = 0; i < controller.buttons.length; i++) {
      var val = controller.buttons[i]
      var pressed = val == 1.0
      if (typeof (val) === 'object') {
        pressed = val.pressed
        val = val.value
      }

      var pct = Math.round(val * 100) + '%'

      if (pressed) {
        // console.log('Button pressed')
      }
    }

    for (i = 0; i < controller.axes.length; i++) {
      console.log(controller.axes[i])
    }
  }

  requestAnimationFrame(updateStatus)
}

function scangamepads () {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i]
      } else {
        addgamepad(gamepads[i])
      }
    }
  }
}

function deadzone (v) {
  const DEADZONE = 0.2

  if (Math.abs(v) < DEADZONE) {
    v = 0
  } else {
    // Smooth
    v = v - Math.sign(v) * DEADZONE
    v /= (1.0 - DEADZONE)
  }
  return v
}

window.addEventListener('gamepadconnected', connecthandler)
window.addEventListener('gamepaddisconnected', disconnecthandler)

if (!haveEvents) {
  setInterval(scangamepads, 500)
}
