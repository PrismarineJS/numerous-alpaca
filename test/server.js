'use strict';

process.env.NODE_ENV = 'test';

const net = require('net');
const mc = require('pocket-minecraft-protocol');
var os = require('os');

describe('server', function() {
  this.timeout(5000);
  let serv;
  let client;
  let spawned = false;
  let listening = false;

  before(function(done) {
    serv = require('../app');

    client = mc.createClient({
      host: os.hostname(),
      port: 19132,
      username: 'echo'
    });

    serv._server.socket.on('listening', function() {
      listening = true;
      done(null);
    });
  });

  after(function(done){
    serv._server.socket.close();
    serv._server.socket.on('close', function() {
      client.end();
      done();
    });
  });

  it('is running', function(done) {
    if(listening) {
      done();
    }
  });

  if(process.env.CIRCLECI != 'true') {
    it('can log in', function(done) {
      client.on('player_status', function() {
        done();
      });

      client.on('respawn', function() {
        spawned = true;
      });

      client.on('error', function(err) {
        throw err;
      });
    });

    it('spawned', function(done) {
      if(spawned == true) {
        done(); // this is pretty hacky
      }
    });

    it('can chat', function(done) {
      client.writeMCPE('text', {
        type: 1,
        name: 'echo',
        message: 'hi'
      });

      client.on('text', function(packet) {
        if('<' + packet.name + '> ' + packet.message == '<echo> hi') {
          done();
        }
      });
    });
  }
});
