/**
 * opts: {
 *  device_id
 *  color
 *  sprite_key
 *  init_health
 *  bullet_kill_distance
 *  kill_countdown_rate
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
  this.player_name = opts.label || "Player";

  Phaser.Sprite.call(this, game, x, y, opts.sprite_key || 'player');
  this.unit_type = 'Unit';
  this.name = "Unit";

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setCircle(this.radius);
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
  this.text1 = game.add.text(0, 0, this.player_name, style);

  this.init_health = opts.init_health || UNIT_SPECS.HEALTH.MEDIUM;
  this.setHealth(this.init_health);
  this.kill_timeout = null;
  this.seconds_until_kill = null;
  this.kill_start_seconds = opts.kill_countdown || UNIT_SPECS.KILL_COUTDOWN.MEDIUM;
  this.kill_countdown_rate = opts.kill_countdown_rate || UNIT_SPECS.KILL_COUTDOWN_RATE.MEDIUM;

  this.inventory = [];
  this.max_inventory = 2;
  this.collectable_items = ['item_ammo'];

  this.track_colliding_obj = null;

  // Creates 30 bullets, using the 'bullet' graphic
  this.weapon = game.add.weapon(30, 'bullet');
  this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
  this.weapon.bulletKillDistance = opts.bullet_kill_distance || UNIT_SPECS.BULLET_DISTANCE.MEDIUM;
  this.weapon.fireLimit = opts.fire_limit || UNIT_SPECS.AMMO.MEDIUM;
  this.weapon.fireRate = opts.fire_rate || UNIT_SPECS.FIRE_RATE.MEDIUM;
  this.weapon.trackSprite(this, this.radius, 0, true);
  this.weapon.onFireLimit.add(this.onFireLimit.bind(this));

  this.update_device_signal = new Phaser.Signal();
};

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.update = function() {
  this.text1.alignTo(this, Phaser.TOP_CENTER);
  this.game.physics.arcade.velocityFromAngle(this.angle, this.move_velocity, this.body.velocity);

  // Check if still touching tracking object
  if (this.track_colliding_obj) {
    var distance = this.game.physics.arcade.distanceBetween(this, this.track_colliding_obj);
    var is_still_touching = distance <= 2 * this.radius + this.radius / 4;
    if (!is_still_touching) {
      this.track_colliding_obj = null;
    }
  }
};

Unit.prototype.onFireLimit = function() {
  console.log("OUT OF AMMO");
};

Unit.prototype.setInjured = function() {
  if (!this.alive) return;
  this.alive = false;
  this.visible = true;
  this.move_velocity = 0;
  this.body.immovable = true;
  this.alpha = 0.5;

  this.seconds_until_kill = this.kill_start_seconds;
  this.killCountdown();
};

Unit.prototype.killCountdown = function() {
  if (this.seconds_until_kill === null) return;
  var direction = this.is_healing && this.track_colliding_obj !== null ? 1 : -1;
  this.seconds_until_kill += direction;

  if (this.seconds_until_kill >= this.kill_start_seconds) {
    this.setRevived();
  } else if (this.seconds_until_kill <= 0) {
    this.killUnit();
  } else {
    var next_call = direction === 1 ? this.track_colliding_obj.data.heal_rate : this.kill_countdown_rate;
    this.text1.text = this.player_name + " (" + (this.seconds_until_kill) + ")";
    this.kill_timeout = this.game.time.events.add(next_call, this.killCountdown, this);
  }
};

Unit.prototype.killUnit = function() {
  this.text1.text = this.player_name + " (DEAD)";
  this.game.time.events.remove(this.kill_timeout);
  this.seconds_until_kill = null;
  this.track_colliding_obj = null;
  this.kill();
  //TODO: either dead or turns into zombie
};

Unit.prototype.healUnit = function() {
  if (this.seconds_until_kill !== null && this.seconds_until_kill > 0) {
    this.is_healing = true;
  }
};

Unit.prototype.collidesWithUnit = function(unit) {
  if (this.seconds_until_kill && unit.unit_type === "MedicUnit") {
    this.track_colliding_obj = unit;
    this.healUnit();
  }
};

Unit.prototype.setRevived = function() {
  this.alpha = 1;
  this.kill_timeout = null;
  this.game.time.events.remove(this.kill_timeout);
  this.game.time.events.remove(this.kill_countdown);
  this.seconds_until_kill = null;
  this.alive = true;
  this.body.immovable = false;
  this.is_healing = false;
  this.text1.text = this.player_name;
  this.track_colliding_obj = null;
};

Unit.prototype.onHit = function(obj) {
  if (this.health === 1) {
    this.setInjured();
  } else if (!this.kill_timeout) {
    this.damage(1);
    this.update_device_signal.dispatch(this.device_id);
  }
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

Unit.prototype.getShotsLeft = function(data) {
  return this.weapon.fireLimit - this.weapon.shots;
};

Unit.prototype.onVehicleJoin = function(vehicle) {
  this.alive = false;
  this.visible = false;
  this.exists = false;
  this.body.angularVelocity = 0;
  this.move_velocity = 0;
  this.body.immovable = true;
};

Unit.prototype.onVehicleLeave = function(vehicle) {
  var self = this;
  var angle = Phaser.Math.angleBetween(vehicle.centerX, vehicle.centerY, this.x, this.y);
  var diagonal = Phaser.Math.distance(vehicle.centerX, vehicle.centerY, vehicle.x, vehicle.y);
  var distance = this.radius + diagonal + 4;
  this.visible = true;
  this.x = vehicle.centerX + Math.cos(angle) * distance;
  this.y = vehicle.centerY + Math.sin(angle) * distance;
  this.rotation = angle;
  // yeah - otherwise it will trigger onCollide again
  this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function() {
    this.exists = true;
    this.alive = true;
    this.body.immovable = false;
  }, this);
};

Unit.prototype.canCollect = function(item) {
  return this.max_inventory >= this.inventory.length && this.collectable_items.indexOf(item.name) > -1;
};

Unit.prototype.collectItem = function(item) {
  // this.inventory.push(item.data);
  if (item.name === "item_ammo") {
    var amount = item.data.amount;
    this.weapon.resetShots(this.getShotsLeft() + amount);
  }
};

Unit.prototype.toCustomData = function() {
  return {
    alive: this.alive,
    health: this.health,
    inventory: this.inventory,
    ammo: this.getShotsLeft()
  };
};
