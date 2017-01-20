Enemy = function (index, game, opts) {
  opts = opts || {};
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  this.game = game;
  this.radius = 8;

  Phaser.Sprite.call(this, game, x, y, 'enemy');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity = 1;
  this.body.immovable = false;
  this.body.collideWorldBounds = false;

  this.body.maxAngular = 300;
  this.move_speed = 10;
  this.is_stop = true;
  this.angular_move_velocity = 100;
  this.setHealth(3);

  this.target_obj = null;

  game.add.existing(this);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  if (this.target_obj) {
    this.game.physics.arcade.moveToObject(this, this.target_obj, this.move_speed);
    this.rotation = this.game.physics.arcade.angleToXY(this, this.target_obj.x, this.target_obj.y);
  }
};

Enemy.prototype.onBulletHit = function() {
  this.damage(1);
  console.log("HIT", this.health);
};

Enemy.prototype.moveTo = function(obj) {
  this.target_obj = obj;
};
