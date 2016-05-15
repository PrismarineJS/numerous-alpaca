'use strict';

const EventEmitter = require('events').EventEmitter;
const path = require('path');
const requireIndex = require('requireindex');
const plugins = requireIndex(path.join(__dirname));
const version = require('../../package.json').version;
const World = require('../world');
const Logger = require('js-logger');

module.exports.server = function(serv, options) {
  serv.pid = process.pid;

  serv.log = Logger;
  serv.log.useDefaults();

  process.on('SIGINT', function() {
    serv._writeAll('disconnect', {
      message: 'Server\nclosed'
    });
    setTimeout(function(){
      process.exit(0);
    }, 1000);
  });

  if(process.env.NODE_ENV == 'test') {
    serv.log.setLevel(serv.log.OFF);
  }

  serv.log.info('Starting numerous-alpaca server version 0.14.1 (' + version + ')');
  serv.log.info('Started numerous-alpaca server on *:' + serv._server.port);

  serv.on('error', function(error) {
    serv.log.info('Oops! Something went wrong, ' + error);
  });

  serv.world = new World();

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
      serv.log.info(player.name + ' has left the game');
      serv.broadcast(serv.color.yellow + player.name + ' has left the game');

      serv.players.forEach(function(target) {
        target._client.writeMCPE('player_list', {
          type: 1,
          entries: [
            {
              clientUuid: player.uuid
            }
          ]
        });

        target._client.writeMCPE('remove_player', {
          entity_id: player.entity_id,
          client_uuid: player.uuid
        })
      });

      if(serv.onlinePlayers != 0) { serv.onlinePlayers--; }

      const index = serv.players.indexOf(player);
      if (index > -1) {
        serv.players.splice(index, 1);
      }

      const index2 = findWithAttr(serv.list, 'clientUuid', player.uuid);
      if (index2 > -1) {
        serv.list.splice(index2, 1);
      }

      serv.updatePing();
    });

    player._client.on('error', function(err) {
      serv.log.info(err.stack);
    });
  };
};

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
}
