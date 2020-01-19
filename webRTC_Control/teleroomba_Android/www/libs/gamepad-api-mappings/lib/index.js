'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.axialVector = axialVector;
exports.getDeadzoneAlgorithm = getDeadzoneAlgorithm;
var getMapping = exports.getMapping = require('./get-mapping').getMapping;
var deadZones = exports.deadZones = require('./mapping.json').deadZones;

var raw = exports.raw = require('./deadzones').raw;
var normalise = exports.normalise = require('./deadzones').normalise;
var normalize = exports.normalize = require('./deadzones').normalise;

var axial = exports.axial = require('./deadzones').axial;
var radial = exports.radial = require('./deadzones').radial;
var way8 = exports.way8 = require('./deadzones').way8;
var way4 = exports.way4 = require('./deadzones').way4;
var vertical = exports.vertical = require('./deadzones').vertical;
var horizontal = exports.horizontal = require('./deadzones').horizontal;

var postMapping = {
  'raw': raw,
  'normalised': normalise,
  'normalized': normalize
};

function axialVector(coord, deadzone, post) {
  return {
    x: axial(coord.x, deadzone, post),
    y: axial(coord.y, deadzone, post)
  };
}

var algorithms = {
  'axial': axialVector,
  'radial': radial,
  '8-way': way8,
  '4-way': way4,
  'horizontal': horizontal,
  'vertical': vertical
};

function build(algorithm) {
  var mapper = arguments.length <= 1 || arguments[1] === undefined ? postMapping.normalised : arguments[1];

  return function applyAlgorithmAndMapping(coord, deadzone) {
    return algorithm(coord, deadzone, mapper);
  };
}

function getDeadzoneAlgorithm(algorithm, mapper) {
  return build(algorithms[algorithm], postMapping[mapper]);
}