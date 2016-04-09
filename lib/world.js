'use strict';

var fs = require('fs');

class World {
  constructor() {
    this.data = fs.readFileSync(__dirname + "/../world/chunk.dat");
  }

  dump() {
    return this.data;
  }
}

module.exports = World;
