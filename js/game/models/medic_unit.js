MedicUnit = function (index, game, opts) {
  opts = opts || {};
  opts.bullet_kill_distance = UNIT_SPECS.BULLET_DISTANCE.LOW;
  opts.move_speed = UNIT_SPECS.SPEED.MEDIUM;
  opts.init_health = UNIT_SPECS.HEALTH.HIGH;
  opts.fire_limit = UNIT_SPECS.AMMO.LOW;
  Unit.apply(this, arguments);
  this.unit_type = 'MedicUnit';
  this.data.heal_rate = UNIT_SPECS.HEAL_RATE.MEDIUM;
};

MedicUnit.prototype = Object.create(Unit.prototype);
MedicUnit.prototype.constructor = MedicUnit;
