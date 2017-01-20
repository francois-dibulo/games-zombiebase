/**
 * opts: {
 *  device_id
 *  color
 *  sprite_key
 *  init_health
 *  bullet_kill_distance
 *  fire_limit
 *  fire_rate
 *  move_speed
 * }
 */

Unit = function (index, game, opts) {
  opts = opts || {};
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  var color = opts.color || "#00ff00";
  this.dec_color = parseInt(color.substr(1), 16);
  this.device_id = opts.device_id;
  this.game = game;
  this.radius = 8;

  Phaser.Sprite.call(this, game, x, y, opts.sprite_key || 'player');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity = 1;
  this.body.immovable = false;
  this.body.collideWorldBounds = true;

  this.body.maxAngular = 300;
  // this.body.angularDrag = 50;
  this.move_speed = opts.move_speed || UNIT_SPECS.SPEED.MEDIUM;
  this.move_velocity = 0;
  this.is_stop = true;
  this.angular_move_velocity = 100;
  this.move = {
    left: false,
    right: false
  };

  game.add.existing(this);

  var style = { font: "10px Courier", fill: color };
  this.text1 = game.add.text(0, 0, opts.label || "Player", style);

  this.init_health = opts.init_health || UNIT_SPECS.HEALTH.MEDIUM;
  this.setHealth(this.init_health);

  // Creates 30 bullets, using the 'bullet' graphic
  this.weapon = game.add.weapon(30, 'bullet');
  this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
  this.weapon.bulletKillDistance = opts.bullet_kill_distance || UNIT_SPECS.BULLET_DISTANCE.MEDIUM;
  this.weapon.fireLimit = opts.fire_limit || UNIT_SPECS.AMMO.MEDIUM;
  this.weapon.fireRate = opts.fire_rate || UNIT_SPECS.FIRE_RATE.MEDIUM;
  this.weapon.trackSprite(this, 0, 0, true);
  this.weapon.onFireLimit.add(this.onFireLimit.bind(this));
};

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.update = function() {
  this.text1.alignTo(this, Phaser.CENTER_TOP, 16);
  this.game.physics.arcade.velocityFromAngle(this.angle, this.move_velocity, this.body.velocity);
};

Unit.prototype.onFireLimit = function() {
  console.log("OUT OF AMMO");
};

Unit.prototype.onBulletHit = function() {
  this.damage(1);
  console.log("HIT", this.health);
};

Unit.prototype.onMove = function(data) {
  this.move = data;
  var is_both = data.left && data.right;
  this.body.angularVelocity = 0;
  if (is_both) {
    this.is_stop = !this.is_stop;
    this.move_velocity = this.is_stop ? 0 : this.move_speed;
  } else if (data.left) {
    this.body.angularVelocity = -this.angular_move_velocity;
  } else if (data.right) {
    this.body.angularVelocity = this.angular_move_velocity;
  }
};

Unit.prototype.onShoot = function(data) {
  this.weapon.fire();
};

Unit.prototype.onVehicleJoin = function(vehicle) {
  this.alive = false;
  this.visible = false;
  this.move_velocity = 0;
  this.body.immovable = true;
};

Unit.prototype.onVehicleLeave = function(vehicle) {
  this.alive = true;
  this.visible = true;
  this.body.immovable = false;
};
