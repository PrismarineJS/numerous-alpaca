'use strict';

module.exports.server = function(serv) {
  serv._writeAll = function(packetName, packetFields) {
    serv.players.forEach(function(player) {
      player._client.writeMCPE(packetName, packetFields);
    });
  }
}
