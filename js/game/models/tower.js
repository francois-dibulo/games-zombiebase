// game, x, y, key, frame
var Tower = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.weapon = null;
  this.units = {};
  this.unit_capacity = 1;

  this.angular_move_velocity = 100;

  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
  this.body.moves = false;

  this.canon = game.add.sprite(0, 0, 'tower_canon');
  this.canon.anchor.setTo(0, 0.5);
  game.physics.enable(this.canon, Phaser.Physics.ARCADE);
  this.canon.alignIn(this, Phaser.CENTER_CENTER, -16, 20);

  this.initWeapon();
};
Tower.prototype = Object.create(Phaser.Sprite.prototype);
Tower.prototype.constructor = Tower;

Tower.prototype.update = function() {
  this.game.physics.arcade.velocityFromAngle(this.canon.angle, 0, this.canon.body.velocity);
};

Tower.prototype.canUnitJoin = function() {
  return Object.keys(this.units).length < this.unit_capacity;
};

Tower.prototype.addUnit = function(unit) {
  var joined = this.canUnitJoin();
  if (joined) {
    this.units[unit.device_id] = unit;
  }
  return joined;
};

Tower.prototype.removeUnit = function(device_id) {
  delete this.units[device_id];
};

Tower.prototype.initWeapon = function() {
  this.weapon = this.game.add.weapon(30, 'bullet_big');
  this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
  this.weapon.bulletKillDistance = UNIT_SPECS.BULLET_DISTANCE.HIGH;
  this.weapon.fireLimit = UNIT_SPECS.AMMO.HIGH;
  this.weapon.fireRate = UNIT_SPECS.FIRE_RATE.MEDIUM;
  this.weapon.trackSprite(this.canon, this.canon.width, -this.canon.height / 4, true);
  this.weapon.onFireLimit.add(this.onFireLimit.bind(this));
};

Tower.prototype.onFireLimit = function() {
  console.log("Tower out of ammo");
};

Tower.prototype.onMove = function(data) {
  if (data.left) {
    this.canon.body.angularVelocity = -this.angular_move_velocity;
  } else if (data.right) {
    this.canon.body.angularVelocity = this.angular_move_velocity;
  } else {
    this.canon.body.angularVelocity = 0;
  }
};

Tower.prototype.onShoot = function(data) {
  this.weapon.fire();
  var recoil_distance = 5;
  var angle = Phaser.Math.reverseAngle(Phaser.Math.degToRad(this.canon.angle));
  var x = this.canon.x + Math.cos(angle) * recoil_distance;
  var y = this.canon.y + Math.sin(angle) * recoil_distance;

  if (!this.recoil_tween || (this.recoil_tween && !this.recoil_tween.isRunning)) {
    this.recoil_tween = this.game.add.tween(this.canon).to({ x: x, y: y }, 150, Phaser.Easing.Bounce.Out, true);
    this.recoil_tween.yoyo(true, 0);
  }
};

Tower.prototype.onUnitLeave = function(device_id) {
  this.removeUnit(device_id);
};
