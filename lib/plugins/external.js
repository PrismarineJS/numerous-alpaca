'use strict';

module.exports.server = function(serv, settings) {
  serv.plugins = {};
  serv.pluginCount = 0;
  serv.externalPluginsLoaded = false;

  serv.addPlugin = function(name, plugin, set) {
    if (!name || !plugin) throw new Error('You need a name and object for your plugin!');
    serv.plugins[name] = {
      id: serv.pluginCount,
      name: name,
      player: plugin.player,
      server: plugin.server,
      settings: set,
      enabled: true
    };
    serv.pluginCount++;
    if (serv.externalPluginsLoaded && plugin.server) serv.plugins[name].server.call(p, serv, settings);
  }

  Object.keys(settings.plugins).forEach(function(p) {
    if (settings.plugins[p].disabled) return;
    try {
      require.resolve(p);
    } catch (err) {
      try {
        require.resolve('../../plugins/' + p);
      } catch (err) {
        throw new Error('Cannot find plugin "' + p + '"');
      }
      serv.addPlugin(p, require('../../plugins/' + p), settings.plugins[p]);
      return;
    }
    serv.addPlugin(p, require(p), settings.plugins[p]);
  });

  Object.keys(serv.plugins).forEach(function(p) {
    if (serv.plugins[p].server) serv.plugins[p].server.call(serv.plugins[p], serv, settings);
  });

  serv.on('asap', function() {
    Object.keys(serv.plugins).map(function(p) {
      serv.log.info('"' + serv.plugins[p].name + '" loaded');
    });
  });

  serv.externalPluginsLoaded = true;
};

module.exports.player = function(player, serv) {
  Object.keys(serv.plugins).forEach(function(p) {
    const plugin = serv.plugins[p];
    if (plugin.player) plugin.player.call(plugin, player, serv);
  });
};
