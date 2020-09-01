var gp = {

    data: {
        lV: 0,
        rV: 0
    },
    knob: null,
    mapKnob: null,
    size: 80,
    trigger: 0

}

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};
var gamepadLastTimestamp = -1;
var throttle = 255;
gp.throttle = (throttle / 255).toPrecision(3);

window.addEventListener('load', function () {
    gp.init(80);
})

gp.init = function (size) {
    gp.knob = document.getElementById('EX3DShow_knob');
    gp.mapKnob = document.getElementById('EX3DShow_map');
    var range = document.getElementById('EX3DShow_range');

    if (size) {
        gp.size = size;
    };

    range.style.height = size * 2 + 'px';
    range.style.width = size * 2 + 'px';
}

gp.calcuDrive2 = function (roll, pitch) {
    var deltaX = roll;
    var deltaY = pitch;

    gp.knob.style.transform = 'translateX(' + deltaX * gp.size + 'px) translateY(' + deltaY * gp.size + 'px)';

    var arcTanValue = Math.atan(deltaY / deltaX);

    // console.log( arcTanValue / Math.PI * 360 );

    var ratio = null;
    var map = {};

    ratio = Math.sin(arcTanValue);

    if (Math.abs(deltaY / deltaX) > 1) {
        ratio = Math.sin(arcTanValue);
        map = getMapVal();

        if (deltaY < 0) {
            map.x = -map.x;
            map.y = -map.y;
        }
    } else {
        ratio = Math.cos(arcTanValue);
        map = getMapVal();

        if (deltaX < 0) {
            map.x = -map.x;
            map.y = -map.y;
        }
    }

    function getMapVal() {
        var map = {};
        var disDelta = (Math.sqrt(Math.pow(deltaX * gp.size, 2) + Math.pow(deltaY * gp.size, 2)));
        map.r = disDelta * ratio * gp.throttle;
        map.x = Math.cos(arcTanValue) * map.r;
        map.y = Math.sin(arcTanValue) * map.r;

        return map;
    }

    gp.mapKnob.style.transform = 'translateX(' + map.x + 'px) translateY(' + map.y + 'px)';

    var power = Math.abs((map.r / gp.size).toPrecision(3));
    var dir = (arcTanValue / Math.PI * 180);
    if (dir < 0) {
        dir += 180;
    }
    dir = Number(dir.toPrecision(3));

    if (deltaY < 0) {
        map = getMapVal();

        gp.data.lV = parseInt((dir / 45 - 1) * power * power * 50);
        gp.data.rV = parseInt((3 - dir / 45) * power * power * 50);

        var VLimit = Math.round(50 * gp.throttle * gp.throttle);

        if (gp.data.lV > VLimit) {
            gp.data.lV = VLimit;
        }
        if (gp.data.rV > VLimit) {
            gp.data.rV = VLimit;
        }
    } else {
        gp.data.lV = parseInt((dir / 45 - 1) * power * power * -50);
        gp.data.rV = parseInt((3 - dir / 45) * power * power * -50);

        var VLimit = Math.round(-50 * gp.throttle * gp.throttle);

        if (gp.data.lV < VLimit) {
            gp.data.lV = VLimit;
        }

        if (gp.data.rV < VLimit) {
            gp.data.rV = VLimit;
        }
    }

    if (isNaN(gp.data.rV) || isNaN(gp.data.lV)) {
        gp.data = {
            lV: 0,
            rV: 0
        }
    }

    gp.data.type = 'DR';
    console.log(gp.data);
    WebRTCDataMethold.sendData(gp.data);
}

gp.calcuDrive = function (roll, pitch) {

    var deltaX = roll * 50;
    var deltaY = pitch * 50;
    
    gp.knob.style.transform = 'translateX(' + deltaX/50 * gp.size + 'px) translateY(' + deltaY/50 * gp.size + 'px)';

    console.log("deltaY = " + deltaY);
    console.log("deltaX = " + deltaX);

    let speedVector = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    let arcTanValue = (Math.atan(deltaX / (0 - deltaY)) / (12 * Math.PI));
    let arcCotValue = (Math.atan((0 - deltaY) / deltaX) / (12 * Math.PI));
    let turningSpeed = Math.round(50 * (speedVector / 50) * 1.0);
    console.log("turningSpeed = " + turningSpeed);
    let turningSpeedBack = Math.round(50 * (speedVector / 50) * 1.0);
    console.log("turningSpeedBack = " + turningSpeedBack);

    if (turningSpeed >= 50) {
        turningSpeed = 50;
    }
    if (turningSpeedBack >= 50) {
        turningSpeedBack = 50;
    }

    // forward
    if (0 - deltaY >= 0) {
        // forward left
        if (deltaX <= 0) {
            gp.data.lV = Math.round((speedVector * arcTanValue + (0 - deltaY)) * 1.0);
            if (gp.data.lV >= 50) {
                gp.data.lV = 50;
            }
            gp.data.rV = turningSpeed;
        // forward right
        } else if (deltaX > 0) {
            gp.data.lV = turningSpeed;
            gp.data.rV = Math.round(-1 * (speedVector * arcTanValue) + (0 - deltaY) * 1.0);
            if (gp.data.rV >= 50) {
                gp.data.rV = 50;
            }
        }
    // backward
    } else if (0 - deltaY <= 0) {
        // backward left
        if (deltaX <= 0) {
            gp.data.lV = Math.round((-1 * speedVector * arcTanValue + (0 - deltaY)) * 1.0);
            if (gp.data.lV <= -50) {
                gp.data.lV = -50;
            }
            gp.data.rV = -turningSpeedBack;
        // backward right
        } else if (deltaX > 0) {
            gp.data.lV = -turningSpeedBack;
            gp.data.rV = Math.round((speedVector * arcTanValue) + (0 - deltaY) * 1.0);
            if (gp.data.rV <= -50) {
                gp.data.rV = -50;
            }
        }
    }
    
    if (isNaN(gp.data.rV) || isNaN(gp.data.lV)) {
        gp.data = {
            lV: 0,
            rV: 0
        }
    }

    gp.data.type = 'DR';
    console.log(gp.data);
    WebRTCDataMethold.sendData(gp.data);
}

function connecthandler(e) {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
    requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
    removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
    delete controllers[gamepad.index];
}

function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

function updateStatus() {
    if (!haveEvents) {
        scangamepads();
    }

    var i = 0;

    // use first gamepad detected
    var controller = controllers[0];

    var timestamp = controller.timestamp;

    if (timestamp !== gamepadLastTimestamp) {

        if (buttonPressed(controller.buttons[8])) {
            console.log('Button Back pressed');
        }

        if (buttonPressed(controller.buttons[9])) {
            console.log('Button Start pressed');
        }

        const coord = {
            x: controller.axes[2],
            y: controller.axes[3]
        }
        const deadzone = 0.10;
        const force = radial(coord, deadzone, normalise);
        // console.log(force.x, force.y);

        const x = controller.axes[2];
        // console.log(x);
        const y = controller.axes[3];
        // console.log(y);

        // gp.calcuDrive(x, y);
        gp.calcuDrive(force.x, force.y);
    }

    gamepadLastTimestamp = timestamp;

    requestAnimationFrame(updateStatus);
}

function scangamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            if (gamepads[i].index in controllers) {
                controllers[gamepads[i].index] = gamepads[i];
            } else {
                if (gamepads[i].mapping === 'standard') {
                    addgamepad(gamepads[i]);
                }
            }
        }
    }
}

function raw(scalar) {
    return scalar;
}

function normalise(scalar, deadzone = 0) {
    if (scalar === 0) {
        return scalar;
    }

    const absScalar = Math.abs(scalar);
    const normalised = (absScalar - deadzone) / (1 - deadzone);

    return scalar < 0 ? -normalised : normalised;
}

function radial(coord, deadzone = 0, post = normalise) {
    const angle = Math.atan2(coord.y, coord.x);
    let magnitude = Math.sqrt(coord.x * coord.x + coord.y * coord.y);

    if (magnitude <= deadzone) {
        return {
            x: 0,
            y: 0
        }
    }

    if (magnitude > 1) {
        magnitude = 1;
    }

    return {
        x: Math.cos(angle) * post(magnitude, deadzone),
        y: Math.sin(angle) * post(magnitude, deadzone)
    }
}

window.addEventListener('gamepadconnected', connecthandler);
window.addEventListener('gamepaddisconnected', disconnecthandler);

if (!haveEvents) {
    setInterval(scangamepads, 500);
}
