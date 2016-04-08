#!/usr/bin/env node

var peServer = require('./');
var settings;

try {
  settings = require('./config/settings');
} catch(err) {
  settings = require('./config/default-settings');
}

module.exports = peServer.createPEServer(settings);
