'use strict';
var Vec3 = require('vec3');

module.exports.player = function(player, serv){
  player.spawn = function(packet) {
    serv.spawn = new Vec3(11, 60 + 1.62, 10);

    player.pos = new Vec3(11, 60 + 1.62, 10);
    player.yaw = 0;
    player.headYaw = 0;
    player.pitch = 0;
    player.speed = new Vec3(0, 0, 0);

    player.id = packet.XUID;
    player.entity_id = [0, serv.entityID];
    player.name = packet.displayName;
    player.secret = packet.randomId;
    player.uuid = packet.identity;

    console.log(new Buffer(packet.skinData,"base64").length);
    player.skin = { skin_type: 'Custom', texture: new Buffer(packet.skinData, "base64") };

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
      entityId: [0,-1],
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      yaw: player.yaw,
      headYaw: player.headYaw,
      pitch: player.pitch,
      mode: 0,
      onGround: 1
    });

    player._client.writeMCPE('start_game', {
      seed: -1,
      dimension: 0,
      generator: 1,
      gamemode: 1,
      entityId: [0,-1],
      spawnX: serv.spawn.x,
      spawnY: serv.spawn.y,
      spawnZ: serv.spawn.z,
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      isLoadedInCreative: false,
      dayCycleStopTime: 0,
      eduMode: false,
      worldName: ""
    });

    player._client.writeMCPE('set_spawn_position', {
      x: serv.spawn.x,
      y: serv.spawn.y,
      z: serv.spawn.z
    });

    player._client.writeMCPE('move_player', {
      entityId: [0,-1],
      x: player.pos.x,
      y: player.pos.y + 1.62,
      z: player.pos.z,
      yaw: player.yaw,
      headYaw: player.headYaw,
      pitch: player.pitch,
      mode: 0,
      onGround: 1
    });

    player._client.writeMCPE('set_time', {
      time: 0,
      started: 1
    });

    player._client.writeMCPE('adventure_settings', {
      flags: 0,
      userPermission: player.user_permission,
      globalPermission: player.global_permission
    });

    player._client.writeMCPE('respawn', {
      x: serv.spawn.x,
      y: serv.spawn.y,
      z: serv.spawn.z
    });

    serv.list.push({
      clientUuid: player.uuid,
      entityId: player.entity_id,
      displayName: player.name,
      skin: player.skin
    });

    player._client.on('request_chunk_radius', function() {
      player._client.writeMCPE('chunk_radius_update', {
        chunkRadius: 1
      });

      for (let x = -2; x <=2; x++) {
       for (let z = -2; z <=2; z++) {
        player._client.writeBatch([{"name":"mcpe","params":{name:"full_chunk_data",params:{
          chunkX: x,
          chunkZ: z,
          order: 1,
          chunkData: serv.world.dump()
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
        if(target.identity != player.identity) {
          target._client.writeMCPE('add_player', {
            uuid: player.uuid,
            username: player.name,
            entityId: player.entity_id,
            x: player.pos.x,
            y: player.pos.y,
            z: player.pos.z,
            speedX: player.speed.x,
            speedY: player.speed.y,
            speedZ: player.speed.z,
            yaw: player.yaw,
            headYaw: player.headYaw,
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
            entityId: target.entity_id,
            x: target.pos.x,
            y: target.pos.y,
            z: target.pos.z,
            speedX: target.speed.x,
            speedY: target.speed.y,
            speedZ: target.speed.z,
            yaw: target.yaw,
            headYaw: target.headYaw,
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

    // player._client.on('mcpe', function(packet){ serv.log.info(packet); });

    serv.players.push(player);

    serv.log.info(player.name + '[/' + player._client.socket.address().address + ':' + player._client.socket.address().port + '] logged in with entity id ' + player.entity_id); // pretty sure that's broken
    serv.log.info(player.name + ' joined the game');

    serv.broadcast(serv.color.yellow + player.name + ' has joined the game');

    serv.entityID++;
    serv.onlinePlayers++;

    serv.updatePing();
  };
};
