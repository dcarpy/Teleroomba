// ------Gamepad Control---------//

var gamepad = {}

gamepad.data = {
  lV: 0,
  rV: 0
}

window.addEventListener('load', function () { gamepad.init() })

gamepad.init = function () {
  joypad.set({ axisMovementThreshold: 0.15 })
  joypad.on('connect', e => updateInfo(e))
  joypad.on('disconnect', e => resetInfo(e))
  joypad.on('axis_move', e => {
    console.log(e.detail)
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

function moveBall (e) {
  const { stickMoved, directionOfMovement, axisMovementValue } = e.detail
  if (stickMoved === 'right_stick') {
    switch (directionOfMovement) {
      case 'left':
        console.log(axisMovementValue)
        break
      case 'right':
        console.log(axisMovementValue)
        break
      case 'top':
        console.log(axisMovementValue)
        break
      case 'bottom':
        console.log(axisMovementValue)
        break
    }
  }
}
