'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMapping = getMapping;
var mappingTable = require('./mapping.json');

function getMapping(id, mapping) {

  var deviceMap = mappingTable[id + '-' + mapping];
  if (!deviceMap) {
    deviceMap = mappingTable[mapping];
  }
  if (!deviceMap) {
    deviceMap = mappingTable.standard;
  }

  return deviceMap;
}