Enemy = function (index, game, opts, async_path) {
  opts = opts || {};
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  this.game = game;
  this.async_path = async_path;
  this.radius = 8;
  this.view_radius = Phaser.Math.between(50, 100);
  this.view_radius_circle = new Phaser.Circle(x, y, this.view_radius);

  Phaser.Sprite.call(this, game, x, y, 'enemy');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setCircle(this.radius);
  this.body.maxVelocity = 1;
  this.body.immovable = false;
  this.body.collideWorldBounds = false;

  this.body.maxAngular = 300;
  this.move_speed = Phaser.Math.between(5, 20);
  this.is_stop = true;
  this.angular_move_velocity = 100;
  this.setHealth(3);

  this.target_obj = null;

  this.attack_lock = null;
  this.attack_rate = 1000;

  game.add.existing(this);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  if (this.target_obj) {
    if (this.target_obj.alive) {
      this.game.physics.arcade.moveToObject(this, this.target_obj, this.move_speed);
      this.rotation = this.game.physics.arcade.angleToXY(this, this.target_obj.x, this.target_obj.y);
    } else {
      this.target_obj = null;
    }
  }
};

Enemy.prototype.onHit = function() {
  this.damage(1);
  console.log("HIT", this.health);
};

Enemy.prototype.moveTo = function(obj) {
  this.target_obj = obj;
};

Enemy.prototype.attack = function(obj) {
  var now = new Date().getTime();
  var can_attack = now > this.attack_lock + this.attack_rate;
  if (!this.attack_lock ||
      (this.attack_lock && can_attack)) {
    this.attack_lock = now;
    obj.onHit(this);
  }
};

Enemy.prototype.calculatePathToObj = function(obj) {
  var Block = {
    Origin: this,
    Destination: obj,
    Diagonals: true,
    debugpath: true,
    found: function(path) {
      console.log(path);
    },
    notfound: function() {
      console.log('No path found');
    }
  };
  this.async_path.getPath(Block);
};
