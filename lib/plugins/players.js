'use strict';

module.exports.server = function(serv, options) {
  serv.players = [];
  serv.entityID = 0;
  serv.onlinePlayers = 0;
  serv.list = [];

  serv.getPlayer = function(name) {
    var found = serv.players.filter(function (pl) {
      return pl.name == name;
    });
    if (found.length > 0)
      return found[0];

    return null;
  }

  serv.updatePing = function() {
    var name = serv._server.name.split(';');
    name[4] = serv.onlinePlayers.toString();
    serv._server.name = name.join(';');
  }
}
