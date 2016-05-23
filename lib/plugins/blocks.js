var Vec3 = require('vec3');

module.exports.player = function(player, serv, settings) {
  player._client.on('remove_block', function(packet) {
    serv.destroyBlock(new Vec3(packet.x, packet.y, packet.z));
  });

  player._client.on('use_item', function(packet) {
    if(packet.face == 1) { // no idea, but i have to do this for some reason
      //console.log(packet.blockcoordinates.x, packet.blockcoordinates.y, packet.blockcoordinates.z);
      serv.setBlock(new Vec3(packet.blockcoordinates.x, packet.blockcoordinates.y, packet.blockcoordinates.z), packet.item.block_id);
    }
  });
}

module.exports.server = function(serv) {
  serv.setBlock = function(coords, block_type) {
    serv._writeAll('update_block', {
      blocks: [
        {
          x: coords.x,
          y: coords.y + 1,
          z: coords.z,
          block_id: block_type,
          block_data: 0xb,
          flags: (0 & 0xf)
        }
      ]
    });
  }

  serv.destroyBlock = function(coords) {
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
