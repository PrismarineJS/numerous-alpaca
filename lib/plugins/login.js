'use strict';

const EventEmitter = require('events').EventEmitter;
const path = require('path');
const requireIndex = require('requireindex');
const plugins = requireIndex(path.join(__dirname));
const version = require('../../package.json').version;
const World = require('../world');

module.exports.server = function(serv, options) {
  serv.pid = process.pid;

  console.log('Starting numerous-alpaca server version 0.14.1 (' + version + ')');
  console.log('Started numerous-alpaca server on *:' + serv._server.port);

  serv.on('error', function(error) {
    console.log('Oops! Something went wrong, ' + error);
  });

  serv.world = new World(); // todo, make this actually do stuff

  serv._server.on('connection', function(client) {
    // var name = options.name.split(';');
    // name[4] = serv.onlinePlayers.toString();
    // options.name = name.join(';');
    // console.log(options);
    const player = new EventEmitter();
    player._client = client;

    Object.keys(plugins)
      .filter(pluginName => plugins[pluginName].player != undefined)
      .forEach(pluginName => plugins[pluginName].player(player, serv, options));

    serv.emit("newPlayer", player);
    player.emit('asap');
    player.login();
  });
};

module.exports.player = function(player, serv, settings) {
  player.login = function() {
    var addr = player._client.socket.remoteAddress + ':' + player._client.socket.remotePort;

    player._client.on('mcpe_login', function(packet) {
      player.spawn(packet);
    });

    player._client.on('end', function() {
      console.log(player.name + ' has left the game');
      serv.onlinePlayers--;
    });

    player._client.on('error', function(err) {
      console.log(err.stack);
    });
  };
};
