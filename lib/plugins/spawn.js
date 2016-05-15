'use strict';
var Vec3 = require('vec3');

module.exports.player = function(player, serv){
  player.spawn = function(packet) {
    serv.spawn = new Vec3(11, 30 + 1.62, 10);

    player.pos = new Vec3(11, 30 + 1.62, 10);
    player.yaw = 0;
    player.headYaw = 0;
    player.pitch = 0;
    player.speed = new Vec3(0, 0, 0);

    player.id = packet.client_id;
    player.entity_id = [0, serv.entityID];
    player.name = packet.username;
    player.secret = packet.client_secret;
    player.uuid = packet.client_uuid;
    player.skin = packet.skin;

    player.hunger = 20;
    player.health = 200;
    player.isDead = false;
    player.spawned = false;

    player.user_permission = 2;
    player.global_permission = 2;

    player.defaultMetadata = [
      {
        type: 0,
        key: 0,
        value: 0
      },
      {
        type: 1,
        key: 1,
        value: player.health + 100
      },
      {
        type: 4,
        key: 2,
        value: player.name
      },
      {
        type: 0,
        key: 3,
        value: 1
      },
      {
        type: 0,
        key: 4,
        value: 0
      },
      {
        type: 0,
        key: 15,
        value: 0
      },
      {
        type: 6,
        key: 17,
        value: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    ];

    player._client.writeMCPE('player_status', {
      status: 0
    });

    player._client.writeMCPE('move_player', {
      entity_id: [0,-1],
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      yaw: player.yaw,
      head_yaw: player.headYaw,
      pitch: player.pitch,
      mode: 0,
      on_ground: 1
    });

    player._client.writeMCPE('start_game', {
      seed: -1,
      dimension: 0,
      generator: 1,
      gamemode: 1,
      entity_id: [0,-1],
      spawn_x: serv.spawn.x,
      spawn_y: serv.spawn.y,
      spawn_z: serv.spawn.z,
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      unknown1: 1,
      unknown2: 1,
      unknown3: 0,
      unknown4: ""
    });

    player._client.writeMCPE('set_spawn_position', {
      x: serv.spawn.x,
      y: serv.spawn.y,
      z: serv.spawn.z
    });

    player._client.writeMCPE('move_player', {
      entity_id: [0,-1],
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      yaw: player.yaw,
      head_yaw: player.headYaw,
      pitch: player.pitch,
      mode: 0,
      on_ground: 1
    });

    player._client.writeMCPE('set_time', {
      time: 0,
      started: 1
    });

    player._client.writeMCPE('adventure_settings', {
      flags: 0,
      user_permission: player.user_permission,
      global_permission: player.global_permission
    })

    player._client.writeMCPE('respawn', {
      x: serv.spawn.x,
      y: serv.spawn.y,
      z: serv.spawn.z
    });

    serv.list.push({
      client_uuid: player.uuid,
      entity_id: player.entity_id,
      display_name: player.name,
      skin: player.skin
    });

    player._client.on('request_chunk_radius', function(packet) {
      player._client.writeMCPE('chunk_radius_update', {
        chunk_radius: 1
      });

      for (let x = -1; x <=1; x++) {
       for (let z = -1; z <=1; z++) {
        player._client.writeBatch([{"name":"mcpe","params":{name:"full_chunk_data",params:{
          chunk_x: x,
          chunk_z: z,
          order: 1,
          chunk_data: serv.world.dump()
        }}}]);
       }
      }

      player._client.writeMCPE('player_status', {
        status: 3
      });

      player._client.writeMCPE('set_time', {
        time: 0,
        started: 1
      });

      player.spawned = true;
    });

    setTimeout(function() {
      serv._writeAll('player_list', {
        type: 0,
        entries: serv.list
      });
      serv.players.forEach(function(target) {
        if(target.uuid != player.uuid) {
          target._client.writeMCPE('add_player', {
            uuid: player.uuid,
            username: player.name,
            entity_id: player.entity_id,
            x: player.pos.x,
            y: player.pos.y,
            z: player.pos.z,
            speed_x: player.speed.x,
            speed_y: player.speed.y,
            speed_z: player.speed.z,
            yaw: player.yaw,
            head_yaw: player.headYaw,
            pitch: player.pitch,
            item: { blockId: 0 },
            metadata: player.defaultMetadata
          });
        }

        // serv.log.info({
        //   uuid: player.uuid,
        //   username: player.name,
        //   entity_id: player.entity_id,
        //   x: player.pos.x,
        //   y: player.pos.y,
        //   z: player.pos.z,
        //   speed_x: player.speed.x,
        //   speed_y: player.speed.y,
        //   speed_z: player.speed.z,
        //   yaw: player.yaw,
        //   head_yaw: player.headYaw,
        //   pitch: player.pitch,
        //   item: { blockId: 0 }//,
        //   //metadata: player.defaultMetadata
        // });

        if(target.uuid != player.uuid) {
          player._client.writeMCPE('add_player', {
            uuid: target.uuid,
            username: target.name,
            entity_id: target.entity_id,
            x: target.pos.x,
            y: target.pos.y,
            z: target.pos.z,
            speed_x: target.speed.x,
            speed_y: target.speed.y,
            speed_z: target.speed.z,
            yaw: target.yaw,
            head_yaw: target.headYaw,
            pitch: target.pitch,
            item: { blockId: 0 },
            metadata: target.defaultMetadata
          });

          // serv.log.info({
          //   uuid: target.uuid,
          //   username: target.name,
          //   entity_id: target.entity_id,
          //   x: target.pos.x,
          //   y: target.pos.y,
          //   z: target.pos.z,
          //   speed_x: target.speed.x,
          //   speed_y: target.speed.y,
          //   speed_z: target.speed.z,
          //   yaw: target.yaw,
          //   head_yaw: target.headYaw,
          //   pitch: target.pitch,
          //   item: { blockId: 0 }//,
          //   //metadata: target.defaultMetadata
          // });
        }
      });
    }, 900);

    //player._client.on('mcpe', function(packet){ serv.log.info(packet); });

    serv.players.push(player);

    serv.log.info(player.name + '[/' + player._client.socket.address().address + ':' + player._client.socket.address().port + '] logged in with entity id ' + player.entity_id); // pretty sure that's broken
    serv.log.info(player.name + ' joined the game');

    serv.broadcast(serv.color.yellow + player.name + ' has joined the game');

    serv.entityID++;
    serv.onlinePlayers++;

    serv.updatePing();
  };
};
