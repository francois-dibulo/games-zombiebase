SoldierUnit = function (index, game, opts) {
  opts = opts || {};
  opts.bullet_kill_distance = UNIT_SPECS.BULLET_DISTANCE.HIGH;
  opts.fire_limit = UNIT_SPECS.AMMO.HIGH;
  opts.fire_rate = UNIT_SPECS.FIRE_RATE.HIGH;
  Unit.apply(this, arguments);
  this.unit_type = 'SoldierUnit';
};

SoldierUnit.prototype = Object.create(Unit.prototype);
SoldierUnit.prototype.constructor = SoldierUnit;
