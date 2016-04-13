'use strict';

const EventEmitter = require('events').EventEmitter;
const path = require('path');
const requireIndex = require('requireindex');
const plugins = requireIndex(path.join(__dirname));
const version = require('../../package.json').version;
const World = require('../world');

module.exports.server = function(serv, options) {
  serv.pid = process.pid;

  // send a message to all players that the server has been shut down
  process.on('SIGINT', function() {
    serv._writeAll('disconnect', {
      message: 'Server closed'
    });
    setTimeout(function(){
      process.exit(0);
    }, 1000);
  });

  console.log('Starting numerous-alpaca server version 0.14.1 (' + version + ')');
  console.log('Started numerous-alpaca server on *:' + serv._server.port);

  serv.on('error', function(error) {
    console.log('Oops! Something went wrong, ' + error);
  });

  serv.world = new World(); // todo, make this actually do stuff

  serv._server.on('connection', function(client) {
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

    player._client.on('game_login', function(packet) {
      player.spawn(packet);
    });

    player._client.on('end', function() {
      console.log(player.name + ' has left the game');
      serv.broadcast(serv.color.yellow + player.name + ' has left the game');

      if(serv.onlinePlayers != 0) { // prevent negative values, although this shouldn't ever happen
        serv.onlinePlayers--;
      }

      const index = serv.players.indexOf(player);
      if (index > -1) {
        serv.players.splice(index, 1);
      }

      var name = serv._server.name.split(';');
      name[4] = serv.onlinePlayers.toString();
      serv._server.name = name.join(';');
    });

    player._client.on('error', function(err) {
      console.log(err.stack);
    });
  };
};
