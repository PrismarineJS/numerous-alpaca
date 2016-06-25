module.exports.player = function(player, serv) {
  player._client.on('move_player', function(packet) {
    player.pos.x = packet.x;
    player.pos.y = packet.y;
    player.pos.z = packet.z;

    player.yaw = packet.yaw;
    player.headYaw = packet.headYaw;
    player.pitch = packet.pitch;

    serv.players.forEach(function(target) {
      if(target.uuid != player.uuid) {
        target._client.writeMCPE('move_player', {
          entityId: player.entityId,
          x: player.pos.x,
          y: player.pos.y,
          z: player.pos.z,
          yaw: player.yaw,
          headYaw: player.headYaw,
          pitch: player.pitch,
          mode: packet.mode,
          onGround: packet.onGround
        });
      }
    });
  });

  player._client.on('animate', function(packet) {
    serv.players.forEach(function(target) {
      if(target.uuid != player.uuid) {
        target._client.writeMCPE('animate', {
          actionId: packet.actionId,
          entityId: player.entityId
        });
      }
    });
  });

  player._client.on('interact', function(packet) {
    serv.players.forEach(function(target) {
      if(target.uuid != player.uuid) {
        target._client.writeMCPE('interact', {
          actionId: packet.actionId,
          targetEntityId: packet.targetEntityId
        });
      }
    });
  });
}
