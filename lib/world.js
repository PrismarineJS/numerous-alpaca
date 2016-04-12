'use strict';

var Anvil = require('mcpe-anvil').Anvil;
var level = require('mcpe-anvil').level;
var fs = require('fs');

class World {
  constructor() {
    this.data = fs.readFileSync(__dirname + '/../world/chunk.dat');
  }

  loadLevelInfo() {
    //return nbt.parseUncompressed(fs.readFileSync(__dirname + '/../world/level.dat').slice(8), true);
  }

  saveLevelInfo(input) {
    //fs.writeFileSync(__dirname + '/../world/level.dat', nbt.writeUncompressed(input, true));
  }

  dump() {
    return this.data;
  }
}

module.exports = World;
