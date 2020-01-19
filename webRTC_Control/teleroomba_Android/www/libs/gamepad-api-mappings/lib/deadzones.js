'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.raw = raw;
exports.normalise = normalise;
exports.axial = axial;
exports.radial = radial;
exports.way8 = way8;
exports.way4 = way4;
exports.vertical = vertical;
exports.horizontal = horizontal;
function raw(scalar) {
  return scalar;
}

function normalise(scalar) {
  var deadzone = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (scalar === 0) {
    return scalar;
  }

  var absScalar = Math.abs(scalar);
  var normalised = (absScalar - deadzone) / (1 - deadzone);

  return scalar < 0 ? -normalised : normalised;
}

function axial(scalar) {
  var deadzone = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  var magnitude = Math.sqrt(scalar * scalar);

  if (magnitude <= deadzone) {
    return 0;
  }

  if (magnitude > 1) {
    return scalar < 0 ? -1 : 1;
  }

  return scalar < 0 ? -post(magnitude, deadzone) : post(magnitude, deadzone);
}

function radial(coord) {
  var deadzone = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  var angle = Math.atan2(coord.y, coord.x);
  var magnitude = Math.sqrt(coord.x * coord.x + coord.y * coord.y);

  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  if (magnitude > 1) {
    magnitude = 1;
  }

  return {
    x: Math.cos(angle) * post(magnitude, deadzone),
    y: Math.sin(angle) * post(magnitude, deadzone)
  };
}

function snapToRadian(coord, deadzone, axes) {
  var post = arguments.length <= 3 || arguments[3] === undefined ? raw : arguments[3];

  var angle = Math.atan2(coord.y, coord.x);
  var snapRadians = Math.PI / axes;
  var newAngle = snapRadians * Math.round(angle / snapRadians);
  var magnitude = Math.sqrt(coord.x * coord.x + coord.y * coord.y);

  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  if (magnitude > 1) {
    magnitude = 1;
  }

  return {
    x: Math.cos(newAngle) * post(magnitude, deadzone),
    y: Math.sin(newAngle) * post(magnitude, deadzone)
  };
}

function way8(coord) {
  var deadzone = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  return snapToRadian(coord, deadzone, 4, post);
}

function way4(coord) {
  var deadzone = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  return snapToRadian(coord, deadzone, 2, post);
}

function vertical(coord, deadzone) {
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  return {
    x: 0,
    y: snapToRadian(coord, deadzone, 2, post).y
  };
}

function horizontal(coord, deadzone) {
  var post = arguments.length <= 2 || arguments[2] === undefined ? raw : arguments[2];

  return {
    x: snapToRadian(coord, deadzone, 2, post).x,
    y: 0
  };
}