module.exports.player = function(player, serv) {
  player._client.on('move_player', function(packet) {
    player.pos.x = packet.x;
    player.pos.y = packet.y;
    player.pos.z = packet.z;

    player.yaw = packet.yaw;
    player.headYaw = packet.head_yaw;
    player.pitch = packet.pitch;

    console.log(player.pos.x, player.pos.y, player.pos.z);

    serv.players.forEach(function(target) {
      if(target.uuid != player.uuid) {
        target._client.writeMCPE('move_player', {
          entity_id: player.entity_id,
          x: player.pos.x,
          y: player.pos.y,
          z: player.pos.z,
          yaw: player.yaw,
          head_yaw: player.headYaw,
          pitch: player.pitch,
          mode: packet.mode,
          on_ground: packet.on_ground
        });
      }
    });
  });
}
