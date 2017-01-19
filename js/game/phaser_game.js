var PhaserGame = {

  mode: null,
  airconsole: null,
  teams: null,
  phaser: null,
  map: null,
  layer: null,
  objects: {},
  towers_group: null,
  helicopter_landings: null,

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
    this.phaser.load.image('wall', BASE_URL + 'wall.png');
    this.phaser.load.image('tower', BASE_URL + 'tower.png');
    this.phaser.load.image('door_h', BASE_URL + 'door_h.png');
    this.phaser.load.image('helicopter_landing', BASE_URL + 'helicopter_landing.png');
    this.phaser.load.image('player', BASE_URL + 'player.png');
    this.phaser.load.image('enemy', BASE_URL + 'enemy.png');
    this.phaser.load.image('bullet', BASE_URL + 'bullet.png');
    this.phaser.load.tilemap('map', 'assets/levels/level_0.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function () {
    this.phaser.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = this.phaser.add.tilemap('map');
    this.map.addTilesetImage('wall');
    this.map.addTilesetImage('tower');
    //this.map.addTilesetImage('door_h');
    this.map.addTilesetImage('helicopter_landing');

    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    this.towers_group = this.phaser.add.group();
    this.towers_group.classType = Tower;
    this.towers_group.enableBody = true;

    // name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY
    this.map.createFromObjects('Object Layer 1', 2, 'tower', 0, true, false, this.towers_group, Tower);
    this.towers_group.setAll('body.immovable', true);
    this.towers_group.setAll('body.moves', false);

    this.helicopter_landings = this.phaser.add.group();
    this.helicopter_landings.classType = HelicopterLanding;
    this.helicopter_landings.enableBody = true;
    this.helicopter_landings.setAll('body.immovable', true);
    this.helicopter_landings.setAll('body.moves', false);
    this.map.createFromObjects('Object Layer 1', 3, 'helicopter_landing', 0, true, false, this.helicopter_landings, HelicopterLanding);

    this.map.setCollision([1, 2, 3]);

    this.enemies_group = this.phaser.add.group();
    this.enemies_group.classType = HelicopterLanding;
    this.enemies_group.enableBody = true;
    for (var i = 0; i < 10; i++) {
      this.enemies_group.add(new Enemy(i, this.phaser));
    }


    // Scale
    // var scale_manager = new Phaser.ScaleManager(this.phaser, this.map.widthInPixels, this.map.heightInPixels);
    // scale_manager.scaleMode = Phaser.ScaleManager.RESIZE;
    // scale_manager.pageAlignVertically = true;
    // scale_manager.pageAlignHorizontally = true;
    // scale_manager.refresh();

    this.buildPlayers();
    var player_1 = this.objects['unit'][0];
    this.enemies_group.forEach(function(enemy) {
      enemy.moveTo(player_1);
    }, this);
  },

  update: function () {
    if (this.objects['unit']) {
      this.phaser.physics.arcade.collide(this.objects['unit'], this.layer);
      this.phaser.physics.arcade.collide(this.objects['unit'], this.objects['unit']);
      this.phaser.physics.arcade.collide(this.objects['unit'], this.enemies_group);
      this.phaser.physics.arcade.collide(this.objects['unit'], this.towers_group, function() {
      });

      this.phaser.physics.arcade.overlap(this.objects['unit'], this.helicopter_landings, function() {
      });

      // Bullets
      this.phaser.physics.arcade.collide(this.objects['unit'][0].weapon.bullets, this.layer, function(bullet, obj) {
        bullet.kill();
      });

      this.phaser.physics.arcade.collide(this.enemies_group, this.enemies_group);
      this.phaser.physics.arcade.collide(this.enemies_group, this.layer);
      this.phaser.physics.arcade.collide(this.objects['unit'][0].weapon.bullets, this.enemies_group, function(bullet, obj) {
        bullet.kill();
        obj.onBulletHit(bullet);
      });

      this.phaser.physics.arcade.collide(this.objects['unit'][0].weapon.bullets, this.objects['unit'], function(other_unit, bullet) {
        other_unit.onBulletHit(bullet);
        bullet.kill();
      });
    }
  },

  render: function () {

  },

  // =====================================================================================
  // PLAYERS
  // =====================================================================================

  buildPlayers: function() {
    var teams = this.teams;
    this.objects['unit'] = [];
    for (var i = 0; i < this.teams.length; i++) {
      var start_base = this.helicopter_landings.children[i];
      var players = this.teams[i].players;
      for (var p = 0; p < players.length; p++) {
        var player = players[p];
        var opts = {
          color: player.color,
          label: player.name,
          x: start_base.x + 8 * p,
          y: start_base.y
        };
        var unit = new Unit(p, this.phaser, opts);
        player.unit = unit;
        this.objects['unit'].push(unit);
      }
    }
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
    }
  }
};
