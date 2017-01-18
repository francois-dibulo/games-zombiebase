var PhaserGame = {

  mode: null,
  airconsole: null,
  teams: null,
  phaser: null,
  map: null,
  layer: null,
  objects: {},

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
    this.phaser.load.tilemap('map', 'assets/levels/level_0.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function () {
    this.phaser.physics.startSystem(Phaser.Physics.ARCADE);

    // Scale
    // var scale_manager = new Phaser.ScaleManager(this.phaser, window.innerWidth, window.innerHeight);
    // scale_manager.scaleMode = Phaser.ScaleManager.RESIZE;
    // scale_manager.pageAlignVertically = true;
    // scale_manager.pageAlignHorizontally = true;
    // scale_manager.refresh();

    this.map = this.phaser.add.tilemap('map');
    this.map.addTilesetImage('wall');
    this.map.addTilesetImage('tower');
    this.map.addTilesetImage('door_h');
    this.map.addTilesetImage('helicopter_landing');

    this.layer = this.map.createLayer('World');
    this.layer.resizeWorld();

    this.map.setCollision([1, 2, 22]);

    this.buildPlayers();
  },

  update: function () {
    if (this.objects['unit']) {
      this.phaser.physics.arcade.collide(this.objects['unit'], this.layer);
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
      var players = this.teams[i].players;
      for (var p = 0; p < players.length; p++) {
        var player = players[p];
        var opts = {
          color: player.color,
          label: player.name
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
    if (player.unit) {
      if (params.action === "move") {
        player.unit.onMove(params.data);
      }
    }
  }
};
