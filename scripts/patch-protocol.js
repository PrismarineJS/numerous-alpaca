'use strict';

// Patch dependencies to fix protodef-validator errors:
//
// 1. pocket-minecraft-protocol/data/protocol.json has a container type
//    in spread format ["container", {...}, {...}] instead of the correct
//    ["container", [{...}, {...}]] format, and a typo "id" instead of "type".
//
// 2. raknet/src/client.js uses lodash.merge which mutates the cached
//    require'd protocol.json object. When the server later creates a Client
//    for an incoming connection, the raknet serializer picks up MCPE protocol
//    types (like uuid, slot) that it doesn't know about, causing validation
//    errors. Fix: clone before merging.

var fs = require('fs');
var path = require('path');

// --- Patch 1: Fix container format in MCPE protocol.json ---

var protocolPath = path.join(__dirname, '..', 'node_modules', 'pocket-minecraft-protocol', 'data', 'protocol.json');

if (fs.existsSync(protocolPath)) {
  var protocol = JSON.parse(fs.readFileSync(protocolPath, 'utf8'));

  function fixContainers(obj) {
    if (Array.isArray(obj)) {
      if (obj.length >= 2 && obj[0] === 'container' && typeof obj[1] === 'object' && !Array.isArray(obj[1])) {
        var fields = obj.slice(1);
        obj.length = 0;
        obj.push('container', fields);
        fields.forEach(function (field) {
          if (field.id && !field.type) {
            field.type = field.id;
            delete field.id;
          }
        });
        fields.forEach(fixContainers);
      } else {
        obj.forEach(fixContainers);
      }
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(function (key) {
        fixContainers(obj[key]);
      });
    }
  }

  fixContainers(protocol);
  fs.writeFileSync(protocolPath, JSON.stringify(protocol, null, 2));
  console.log('Patched protocol.json container format');
}

// --- Patch 2: Fix merge mutation in raknet Client constructor ---

var clientPath = path.join(__dirname, '..', 'node_modules', 'raknet', 'src', 'client.js');

if (fs.existsSync(clientPath)) {
  var clientSrc = fs.readFileSync(clientPath, 'utf8');
  // Replace: merge(require('../data/protocol.json'),customPackets)
  // With:    merge({},require('../data/protocol.json'),customPackets)
  // This prevents mutating the cached require'd object
  var oldCode = "merge(require('../data/protocol.json'),customPackets)";
  var newCode = "merge({},require('../data/protocol.json'),customPackets)";
  if (clientSrc.indexOf(oldCode) !== -1) {
    clientSrc = clientSrc.replace(oldCode, newCode);
    fs.writeFileSync(clientPath, clientSrc);
    console.log('Patched raknet client.js merge mutation');
  }
}
