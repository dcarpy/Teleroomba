// ------Gamepad Control---------//

var gamepad = {}

gamepad.data = {
  lV: 0,
  rV: 0
}

window.addEventListener('load', function () { gamepad.init() })

gamepad.init = function () {
  joypad.set({ axisMovementThreshold: 0.1 })
  joypad.on('connect', e => updateInfo(e))
  joypad.on('disconnect', e => resetInfo(e))
  joypad.on('axis_move', e => {
	//const { gamepad } = e;
	//const { gp } = e.detail;
	//console.log(gp.id)
    console.log(e.gamepad.id)
    return moveBall(e)
  })
}

function resetInfo (e) {
  console.log(e)
  // heading.innerText = 'No gamepad connected!';
  // message.innerText = 'Please connect a controller and press any key to start.';
};

function updateInfo (e) {
  // const { gamepad } = e;
  console.log(e)
  // heading.innerText = 'Gamepad connected!';
  // message.innerText = gamepad.id + '\n\n' + 'Use the left stick to move the ball.';
};

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

function moveBall (e) {
  const { stickMoved, directionOfMovement, axisMovementValue, axis } = e.detail
  if (stickMoved === 'right_stick') {
    switch (directionOfMovement) {
      case 'left':
        console.log(axisMovementValue)
        console.log(deadzone(axisMovementValue))
		console.log(axis)
        break
      case 'right':
        console.log(axisMovementValue)
        console.log(deadzone(axisMovementValue))
        break
      case 'top':
        console.log(axisMovementValue)
        console.log(deadzone(axisMovementValue))
        break
      case 'bottom':
        console.log(axisMovementValue)
        console.log(deadzone(axisMovementValue))
        break
    }
  }
}