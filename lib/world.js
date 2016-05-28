'use strict';

var Chunk = require('mcpe-chunk');
var Vec3 = require('vec3');
var fs = require('fs');

class World {
  constructor() {
    this.chunk = new Chunk();

    for (var x = 0; x < 16; x++) {
      for (var z = 0; z < 16; z++) {
        this.chunk.setBlockType(new Vec3(x, 50, z), 2);
        this.chunk.setBiome(new Vec3(x, 50, z), 0);
        this.chunk.setBiomeColor(new Vec3(x, 50, z), 141, 184, 113);
        for (var y = 0; y < 128; y++) {
          this.chunk.setSkyLight(new Vec3(x, y, z), 15);
          this.chunk.setBlockLight(new Vec3(x, y, z), 15);
        }
      }
    }
  }

  dump() {
    return this.chunk.dump();
  }
}

module.exports = World;
