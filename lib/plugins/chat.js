'use strict';

module.exports.player = function(player, serv) {
  player._client.on('mcpe_text', function(packet) {
    if(packet.type == 1) {
      serv._writeAll('mcpe_text', {
        type: 1,
        name: packet.name,
        message: packet.message
      });
    }
  });
}

module.exports.server = function(serv) {
  serv.broadcast = function(message) {
    serv._writeAll('mcpe_text', {
      type: 1,
      name: '',
      message: message
    });
  }

  serv.color = {
    'black': '§0',
    'dark_blue': '§1',
    'navy': '§1',
    'dark_green': '§2',
    'green': '§2',
    'teal': '§3',
    'dark_red': '§4',
    'maroon': '§4',
    'purple': '§5',
    'dark_yellow': '§6',
    'gold': '§6',
    'gray': '§7',
    'grey': '§7',
    'silver': '§7',
    'dark_gray': '§8',
    'dark_grey': '§8',
    'indigo': '§9',
    'blue': '§9',
    'bright_green': '§a',
    'lime': '§a',
    'cyan': '§b',
    'aqua': '§b',
    'red': '§c',
    'pink': '§d',
    'yellow': '§e',
    'white': '§f'
  };
}
