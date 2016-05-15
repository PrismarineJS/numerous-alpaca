var Vec3 = require('vec3');

module.exports.player = function(player, serv, settings) {
  player._client.on('remove_block', function(packet) {
    //serv.destroyBlock(new Vec3(packet.x, packet.y, packet.z));
    serv._writeAll('update_block', {
      blocks: [
        {
          x: coords.x,
          y: coords.y,
          z: coords.z,
          blockData: 0,
          flags: 0
        }
      ]
    })
  });

  player._client.on('use_item', function(packet) {

  });
}

module.exports.server = function(serv) {
  serv.setBlock = function(coords, block_type) {
    //serv.world.setBlock(new Vec3(coords.x, coords.y, coords.z), block_type);

    serv._writeAll('update_block', {

    });
  }

  serv.destroyBlock = function(coords) {
    //serv.world.setBlock(new Vec3(coords.x, coords.y, coords.z), 0);

    serv._writeAll('update_block', {
      blocks: [
        {
          x: coords.x,
          y: coords.y,
          z: coords.z,
          blockData: 0,
          flags: 0
        }
      ]
    });
  }
}
