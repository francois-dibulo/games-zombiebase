Helicopter = function (game, opts) {
  opts = opts || {};
  this.game = game;
  this.state = Helicopter.State.Flying;
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  Phaser.Sprite.call(this, game, x, y, opts.sprite_key || 'heli');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity = 1;
  this.body.immovable = false;

  this.move_speed = 40;
  this.units = {};
  this.pilot_unit_device_id = null;

  this.unit_capacity = 10;

  game.add.existing(this);
};

Helicopter.State = {
  Landing: 'landing',
  Landed: 'landed',
  Flying: 'flying'
};

Helicopter.prototype = Object.create(Phaser.Sprite.prototype);
Helicopter.prototype.constructor = Helicopter;

Helicopter.prototype.isFlying = function() {
  return this.state === Helicopter.State.Flying;
};

Helicopter.prototype.isLanded = function() {
  return this.state === Helicopter.State.Landed;
};

Helicopter.prototype.update = function() {
  if (this.target_obj) {
    this.rotation = this.game.physics.arcade.angleToXY(this, this.target_obj.x, this.target_obj.y);
  }
};

Helicopter.prototype.setTarget = function(obj) {
  this.target_obj = obj;
  if (obj) {
    this.game.physics.arcade.moveToObject(this, this.target_obj, this.move_speed);
  } else {
    console.log("STOP");
    this.move_speed = 0;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.body.stopMovement();
  }
};

Helicopter.prototype.landOnObj = function(obj) {
  this.state = Helicopter.State.Landing;
  var landing_tween = this.game.add.tween(this.scale).to({ x: 0.7, y: 0.7 }, 2000, Phaser.Easing.Back.Out, true);
  landing_tween.onComplete.add(function() {
    this.state = Helicopter.State.Landed;
  }, this);
};

Helicopter.prototype.canUnitJoin = function() {
  return Object.keys(this.units).length < this.unit_capacity;
};

Helicopter.prototype.onUnitJoin = function(unit) {
  var joined = this.canUnitJoin();
  if (joined) {
    this.units[unit.device_id] = unit;
    if (unit.unit_type === 'PilotUnit') {
      this.pilot_unit_device_id = unit.device_id;
    }
  }
  return joined;
};

Helicopter.prototype.onUnitLeave = function(device_id) {
  // TODO: only leave when landed?!
  if (device_id === this.pilot_unit_device_id) {
    this.pilot_unit_device_id = null;
  }
  delete this.units[device_id];
};

Helicopter.prototype.onMove = function(data) {
  if (!this.pilot_unit_device_id) {
    console.info("No pilot :D");
  }
};

Helicopter.prototype.onShoot = function(data) {

};
