App.services.factory('PlayerService', ['AirConsoleService', function (AirConsoleService) {
  var service = {
    ctrl: {},
    screen: {},
    players: [],
    players_map: {},
    device_player: null
  };

  var Event = {
    PlayerUpdate: 'on_update_player'
  };

  // ======================================================
  // SHARED
  // ======================================================
  var airconsole = AirConsoleService.airconsole;

  var player_colors = ['#77bbff', '#ff9900', '#99ee00', '#f4359e',
                      '#651067', '#b82e2e', '#329262', '#9c5935',
                      '#3b3eee', '#fb9a99', '#ccbb22', '#cab2d6',
                      '#aaffaa', '#b91383', '#008800', '#660000',
                      '#ff0000', '#ffff00', '#00ff00', '#0000ff',
                      '#743411', '#111177', '#b77322', '#66aa00',
                      '#00aac6', '#a9c413', '#9e8400', '#5574a6',
                      '#777777', '#999999', '#bbbbbb', '#eeeeee'];

  service.init = function() {

    // ======================================================
    // SCREEN
    // ======================================================
    if (AirConsoleService.isScreen()) {

      var player_map_key = 'player_map_key';

      service.updatePlayersMap = function(no_broadcast) {
        var formated_map = {};
        for (var device_id in this.players_map) {
          var player = this.players_map[device_id];
          formated_map[device_id] = {
            device_id: device_id,
            color: player.color,
            stats: player.stats,
            team_index: player.team_index,
            name: player.name,
            img: player.img,
            current_view: player.current_view,
            class_type: player.class_type,
            move: player.move
          }
        };
        if (!no_broadcast) {
          airconsole.setCustomDeviceStateProperty(player_map_key, formated_map);
        }
      };
      service.updatePlayersMap();

      service.addPlayer = function(device_id) {
        if (this.getPlayerByDeviceId(device_id) !== null) return;
        var color = player_colors[device_id] || player_colors[0];
        var player = {
          device_id: device_id,
          color: color,
          stats: {},
          team_index: null,
          name: airconsole.getNickname(device_id),
          img: airconsole.getProfilePicture(device_id),
          current_view: null,
          class_type: 'EngineerUnit',
          move: {
            left: false,
            right: false
          },
          unit: null,
          default_unit: null
        };
        this.players.push(player);
        this.players_map[device_id] = player;
        this.updatePlayersMap();
      };

      service.removePlayer = function(device_id) {
        var index = this.getPlayerByDeviceId(device_id, true);
        if (index !== null) {
          this.players.splice(index, 1);
          delete this.players_map[device_id];
        } else {
          throw "Could not remove player with device_id " + device_id;
        }
      };

      service.getPlayer = function(device_id) {
        return this.players_map[device_id]
      };

      service.getPlayerByDeviceId = function(id, as_index) {
        var player = null;
        for (var i = 0; i < this.players.length; i++) {
          if (this.players[i].device_id === id) {
            player = as_index ? i : this.players[i];
            break;
          }
        }
        return player;
      };

      airconsole.on(AirConsoleService.Event.Connect, function(device_id, params) {
        service.addPlayer(device_id);
      });

      airconsole.on(Event.PlayerUpdate, function(device_id, params) {
        var player = service.players_map[device_id];
        if (player) {
          _.merge(player, params);
        }
      });

    // ======================================================
    // CTRL
    // ======================================================
    } else {

      service.updatePlayerProperty = function(key, value) {
        var data = {};
        data[key] = value;
        airconsole.sendEvent(AirConsole.SCREEN, Event.PlayerUpdate, data);
      };

    }

  }

  return service;
}]);
