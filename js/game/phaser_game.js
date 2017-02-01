var PhaserGame = {

  mode: null,
  airconsole: null,
  teams: null,
  player_map: {},
  phaser: null,
  map: null,
  layer: null,
  groups: {},
  //
  async_path: null,
  //
  end_countdown_init: 20,
  end_countdown: 20,
  end_timeout: null,
  //
  enemy_handler: null,

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
      'heli',
      'helicopter_landing',
      'player',
      'enemy',
      'bullet',
      'bullet_big',
      'item_ammo',
      'waypoint',
      'generator'
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
    this.map.addTilesetImage('generator');
    this.map.addTilesetImage('helicopter_landing');

    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    this.async_path = this.phaser.plugins.add(Phaser.Plugin.asyncPath);
    this.async_path.tileMap = this.map;
    this.async_path.nonWalkableLayer = 'World';

    // Build Groups
    this.addWaypointGroup();
    this.addTowerGroup();
    this.addHelicopterGroup();
    this.addEnemyGroup();
    this.addItemGroup();
    this.buildPlayers();
    this.addHelicopter();
    this.startCountdown();
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

  addHelicopter: function() {
    var group = this.phaser.add.group();
    group.classType = Helicopter;
    var heli = new Helicopter(this.phaser, {
      x: this.map.widthInPixels / 2 - 64,
      y: this.map.heightInPixels + 64,
    });
    group.add(heli);
    this.groups['heli'] = group;
  },

  addItemGroup: function() {
    var group = this.phaser.add.group();
    group.classType = Item;
    group.enableBody = true;
    // name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY
    this.map.createFromObjects('Object Layer 1', 4, 'item_ammo', 0, true, false, group, Item);
    this.map.createFromObjects('Object Layer 1', 6, 'generator', 0, true, false, group, GeneratorItem);
    this.groups['item'] = group;
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
    group.classType = Enemy;
    group.enableBody = true;
    this.groups['enemy'] = group;
    this.enemy_handler = new EnemyHandler(this.phaser, this.groups, this.async_path);
    //
    var main_target = this.groups['helicopter_landing'].children[0];
    for (var i = 0; i < 6; i++) {
      this.enemy_handler.createEnemy(main_target);
    }
  },

  // =====================================================================================
  // MECHANICS
  // =====================================================================================
  startCountdown: function() {
    this.end_countdown -= 1;
    if (this.end_countdown <= 0) {
      var heli = this.groups['heli'].children[0];
      var start_base = this.groups['helicopter_landing'].children[0];
      heli.setTarget(start_base);
    } else {
      this.end_timeout = this.phaser.time.events.add(Phaser.Timer.SECOND * 1, this.startCountdown, this);
    }
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
    var heli_landing_group = this.groups['helicopter_landing'];
    var heli_group = this.groups['heli'];

    var collide = this.phaser.physics.arcade.collide.bind(this.phaser.physics.arcade);
    var overlap = this.phaser.physics.arcade.overlap.bind(this.phaser.physics.arcade);

    // Helicopter
    overlap(heli_landing_group, heli_group, function(heli_landing, heli) {
      var distance = self.phaser.physics.arcade.distanceBetween(heli_landing, heli);
      if (heli_landing.canHeliLand() && heli.target_obj && distance < 4 && heli.isFlying()) {
        heli.setTarget(null);
        heli.landOnObj(heli_landing);
      }
    });

    overlap(heli_group, units_group, function(heli, unit) {
      if (heli.isLanded() && unit.alive && unit.visible) {
        var player = self.getPlayerByDeviceId(unit.device_id);
        unit.onVehicleJoin(heli);
        heli.onUnitJoin(unit);
        player.unit = heli;
      }
    });

    // Units collision
    collide(units_group, this.layer);
    collide(units_group, units_group, function(unit, other_unit) {
      if (unit.visible && other_unit.visible) {
        other_unit.collidesWithUnit(unit);
        unit.collidesWithUnit(other_unit);
      }
    });
    collide(units_group, enemies_group, function(unit, enemy) {
      if (unit.visible) {
        enemy.attack(unit);
      }
    });
    collide(units_group, towers_group, function(unit, tower) {
      if (tower.canUnitJoin() && unit.alive) {
        var player = self.player_map[unit.device_id];
        unit.onVehicleJoin(tower);
        tower.addUnit(unit);
        player.unit = tower;
      }
    });

    collide(units_group, items_group, function(unit, item) {
      if (unit.canCollect(item)) {
        unit.collectItem(item);
        item.kill();
      }
    });

    // Unit Bullets
    units_group.forEach(function(unit) {
      var bullets = unit.weapon.bullets;

      collide(bullets, this.layer, function(bullet, obj) {
        bullet.kill();
      });

      collide(bullets, enemies_group, function(bullet, obj) {
        if (obj.alive) {
          if (obj.onHit(bullet)) {
            self.increasePlayerStats(unit.device_id, 'enemy_kills');
          }
          bullet.kill();
        }
      });

      collide(bullets, units_group, function(bullet, other_unit) {
        if (other_unit.alive) {
          other_unit.onHit(bullet);
          bullet.kill();
        }
      });
    }, this);

    // Tower Bullets
    towers_group.forEach(function(tower) {
      var bullets = tower.weapon.bullets;
      collide(bullets, enemies_group, function(bullet, obj) {
        if (obj.alive) {
          bullet.kill();
          obj.onHit(bullet);
        }
      });
      collide(bullets, units_group, function(bullet, obj) {
        if (obj.alive) {
          bullet.kill();
          obj.onHit(bullet);
        }
      });
    }, this);

    // Enemies
    this.enemy_handler.update(enemies_group, this.groups, this.layer);
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
    var group = this.phaser.add.group();
    //
    var start_base = this.groups['waypoint'].children[0];
    var angle = 0;
    var start_margin = 32;
    //
    for (var i = 0; i < teams.length; i++) {
      var players = teams[i].players;
      var angle_step = (Math.PI * 2) / players.length;
      for (var p = 0; p < players.length; p++) {
        var player = players[p];
        var start_x = start_base.centerX + Math.cos(angle_step * p) * start_margin;
        var start_y = start_base.centerY + Math.sin(angle_step * p) * start_margin;
        var opts = {
          device_id: player.device_id,
          color: player.color,
          label: player.name,
          x: start_x,
          y: start_y
        };
        var unit = new window[player.class_type](p, this.phaser, opts);

        var start_rotation = this.phaser.physics.arcade.angleToXY(unit, start_base.centerX, start_base.centerY);
        unit.rotation = Phaser.Math.reverseAngle(start_rotation);

        player.unit = unit;
        player.default_unit = unit;
        group.add(unit);
        this.player_map[player.device_id] = player;
        this.updateCustomDeviceData(player.device_id);
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

  updateCustomDeviceData: function(device_id) {
    var custom_data = {};
    var player = this.player_map[device_id];
    var unit = player.default_unit;
    var opts = {
      //name: player.name,
      //color: player.color,
      current_view: player.current_view,
      //class_type: player.class_type,
      stats: player.stats,
      unit: unit.toCustomData()
    };
    //custom_data[device_id] = opts;
    this.airconsole.sendEvent(device_id, 'on_update_player', opts);
    //this.airconsole.setCustomDeviceStateProperty('players', custom_data);
  },

  increasePlayerStats: function(device_id, key, step) {
    var player = this.player_map[device_id];
    var step = step || 1;
    if (player) {
      if (!player.stats[key]) {
        player.stats[key] = 0;
      }
      player.stats[key] = player.stats[key] + step;
    }
  }

};
