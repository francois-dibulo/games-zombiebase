var PhaserGame = {

  mode: null,
  airconsole: null,
  teams: null,
  phaser: null,
  map: null,
  layer: null,
  groups: {},

  init: function(airconsole, teams, mode) {
    this.airconsole = airconsole;
    this.teams = teams;
    this.mode = mode;
    this.phaser = new Phaser.Game(1120, 800, Phaser.AUTO, 'phaser-container', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.update.bind(this),
      render: this.render.bind(this)
    });
  },

  destroy: function() {
    this.phaser.destroy();
    this.phaser = null;
  },

  preload: function () {
    var BASE_URL = 'assets/game/';
    var images = [
      'wall',
      'tower',
      'tower_canon',
      'door_h',
      'helicopter_landing',
      'player',
      'enemy',
      'bullet',
      'item_ammo',
      'waypoint'
    ];
    for (var i = 0; i < images.length; i++) {
      var file = images[i];
      this.phaser.load.image(file, BASE_URL + file + '.png');
    }

    this.phaser.load.tilemap('map', 'assets/levels/level_0.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function () {
    this.phaser.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = this.phaser.add.tilemap('map');
    this.map.addTilesetImage('wall');
    this.map.addTilesetImage('tower');
    this.map.addTilesetImage('item_ammo');
    this.map.addTilesetImage('waypoint');
    //this.map.addTilesetImage('door_h');
    this.map.addTilesetImage('helicopter_landing');

    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    // Build Groups
    this.addWaypointGroup();
    this.addTowerGroup();
    this.addHelicopterGroup();
    this.addEnemyGroup();
    this.addItemGroup();
    this.buildPlayers();

    this.map.setCollision([1, 2, 3, 4]);

    // Scale
    // var scale_manager = new Phaser.ScaleManager(this.phaser, this.map.widthInPixels, this.map.heightInPixels);
    // scale_manager.scaleMode = Phaser.ScaleManager.RESIZE;
    // scale_manager.pageAlignVertically = true;
    // scale_manager.pageAlignHorizontally = true;
    // scale_manager.refresh();

    // Attack player 1
    var player_1 = this.groups['unit'].children[0];
    this.groups['enemy'].forEach(function(enemy) {
      //enemy.moveTo(player_1);
    }, this);
  },

  // =====================================================================================
  // GROUPS
  // =====================================================================================
  addWaypointGroup: function() {
    var group = this.phaser.add.group();
    group.classType = Item;
    group.enableBody = false;
    // name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY
    this.map.createFromObjects('Object Layer 1', 5, 'waypoint', 0, true, false, group);
    this.groups['waypoint'] = group;
  },

  addItemGroup: function() {
    var group = this.phaser.add.group();
    group.classType = Item;
    group.enableBody = true;
    // name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY
    this.map.createFromObjects('Object Layer 1', 4, 'item_ammo', 0, false, false, group, Item);
    this.groups['item'] = group;

    var item = group.getRandom();
    item.exists = true;
  },

  addTowerGroup: function() {
    var group = this.phaser.add.group();
    group.classType = Tower;
    group.enableBody = true;
    // name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY
    this.map.createFromObjects('Object Layer 1', 2, 'tower', 0, true, false, group, Tower);
    this.groups['tower'] = group;
  },

  addHelicopterGroup: function() {
    var group = this.phaser.add.group();
    group.classType = HelicopterLanding;
    group.enableBody = true;
    this.map.createFromObjects('Object Layer 1', 3, 'helicopter_landing', 0, true, false, group, HelicopterLanding);
    this.groups['helicopter_landing'] = group;
  },

  addEnemyGroup: function() {
    var group = this.phaser.add.group();
    group.classType = HelicopterLanding;
    group.enableBody = true;
    for (var i = 0; i < 4; i++) {
      group.add(new Enemy(i, this.phaser));
    }
    this.groups['enemy'] = group;
  },

  // =====================================================================================
  // UPDATE & RENDER
  // =====================================================================================

  update: function () {
    var self = this;
    var units_group = this.groups['unit'];
    var enemies_group = this.groups['enemy'];
    var towers_group = this.groups['tower'];
    var items_group = this.groups['item'];
    var waypoints_group = this.groups['waypoint'];

    // Units collision
    this.phaser.physics.arcade.collide(units_group, this.layer);
    this.phaser.physics.arcade.collide(units_group, units_group, function(unit, other_unit) {
      if (unit.visible && other_unit.visible) {
        other_unit.collidesWithUnit(unit);
        unit.collidesWithUnit(other_unit);
      }
    });
    this.phaser.physics.arcade.collide(units_group, enemies_group, function(unit, enemy) {
      if (unit.visible) {
        enemy.attack(unit);
      }
    });
    this.phaser.physics.arcade.collide(units_group, towers_group, function(unit, tower) {
      if (tower.canUnitJoin() && unit.alive) {
        var player = self.getPlayerByDeviceId(unit.device_id);
        unit.onVehicleJoin(tower);
        tower.addUnit(unit);
        player.unit = tower;
      }
    });

    this.phaser.physics.arcade.collide(units_group, items_group, function(unit, item) {
      if (unit.canCollect(item)) {
        unit.collectItem(item);
        item.kill();
      }
    });

    // Unit Bullets
    units_group.forEach(function(unit) {
      var bullets = unit.weapon.bullets;

      this.phaser.physics.arcade.collide(bullets, this.layer, function(bullet, obj) {
        bullet.kill();
      });

      this.phaser.physics.arcade.collide(bullets, enemies_group, function(bullet, obj) {
        if (obj.alive) {
          bullet.kill();
          obj.onHit(bullet);
        }
      });

      this.phaser.physics.arcade.collide(bullets, units_group, function(bullet, other_unit) {
        if (other_unit.alive) {
          other_unit.onHit(bullet);
          bullet.kill();
        }
      });
    }, this);

    // Tower Bullets
    towers_group.forEach(function(tower) {
      var bullets = tower.weapon.bullets;
      this.phaser.physics.arcade.collide(bullets, enemies_group, function(bullet, obj) {
        if (obj.alive) {
          bullet.kill();
          obj.onHit(bullet);
        }
      });
      this.phaser.physics.arcade.collide(bullets, units_group, function(bullet, obj) {
        if (obj.alive) {
          bullet.kill();
          obj.onHit(bullet);
        }
      });
    }, this);

    // Enemies
    this.phaser.physics.arcade.collide(enemies_group, enemies_group);
    this.phaser.physics.arcade.collide(enemies_group, this.layer);

    this.phaser.physics.arcade.collide(enemies_group, waypoints_group, function(enemy, wp) {
      // if (enemy.target_obj === wp) {
      //   enemy.visited_waypoints.push(wp);
      // }
    });
    // Enemy view radius
    enemies_group.forEach(function(enemy) {
      var main_target = this.groups['helicopter_landing'].children[0];
      units_group.forEach(function(unit) {
        if (unit.alive && unit.visible && enemy.alive) {
          var distance = Phaser.Math.distance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < enemy.view_radius &&
            ((enemy.target_obj && enemy.target_obj.device_id !== unit.device_id) || !enemy.target_obj )) {
            enemy.moveTo(unit);
          }
          if (distance > enemy.view_radius * 2 &&
              (enemy.target_obj && enemy.target_obj.device_id === unit.device_id)) {
            enemy.moveTo(main_target);
          }
        }
      }, this);

      // Move to main object if it has no target
      if (!enemy.target_obj) {
        var closest_wp = waypoints_group.getClosestTo(enemy, function(wp, distance) {

        });
        if (!closest_wp) {
          closest_wp = main_target;
        }
        enemy.moveTo(closest_wp);
      }
    }, this);
  },

  render: function () {
    if (this.groups['unit'] && this.groups['unit'].children) {
      // this.phaser.debug.body(this.groups['unit'].children[0]);
    }
  },

  // =====================================================================================
  // PLAYERS
  // =====================================================================================
  getPlayerByDeviceId: function(device_id) {
    var player = null;
    for (var i = 0; i < this.teams.length; i++) {
      var players = this.teams[i].players;
      for (var p = 0; p < players.length; p++) {
        if (players[p].device_id === device_id) {
          player = players[p];
          break;
        }
      }
    }
    return player;
  },

  buildPlayers: function() {
    var teams = this.teams;
    //this.objects['unit'] = [];
    var group = this.phaser.add.group();
    for (var i = 0; i < this.teams.length; i++) {
      var start_base = this.groups['waypoint'].children[i];
      var players = this.teams[i].players;
      for (var p = 0; p < players.length; p++) {
        var player = players[p];
        var opts = {
          device_id: player.device_id,
          color: player.color,
          label: player.name,
          x: start_base.x + 16 * p,
          y: start_base.y + 16 * p
        };
        var unit = new window[player.class_type](p, this.phaser, opts);
        player.unit = unit;
        player.default_unit = unit;
        group.add(unit);
        unit.update_device_signal.add(this.updateCustomDeviceData, this);
      }
    }
    this.groups['unit'] = group;
  },

  onPlayerLeft: function(player, params) {

  },

  onPlayerInput: function(player, params) {
    //console.info("Ctrl input", player, params);
    if (player.unit && player.unit.alive) {
      if (params.action === "move") {
        player.unit.onMove(params.data);
      }
      if (params.action === "shoot") {
        player.unit.onShoot();
      }
      if (params.action === "exit_vehicle") {
        var vehicle = player.unit;
        if (vehicle && vehicle.onUnitLeave) {
          vehicle.onUnitLeave(player.device_id);
          player.unit = player.default_unit;
          player.unit.onVehicleLeave(vehicle);
        }
      }
    }
  },

  updateCustomDeviceData: function(unit) {
    var custom_data = {};
    for (var i = 0; i < this.teams.length; i++) {
      var players = this.teams[i].players;
      for (var p = 0; p < players.length; p++) {
        var player = players[p];
        var unit = player.default_unit;
        var opts = {
          name: player.name,
          color: player.color,
          current_view: player.current_view,
          class_type: player.class_type,
          stats: player.stats,
          unit: unit.toCustomData()
        };
        custom_data[player.device_id] = opts;
      }
    }
    this.airconsole.setCustomDeviceStateProperty('players', custom_data);
  },

};
