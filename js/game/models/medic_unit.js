MedicUnit = function (index, game, opts) {
  opts = opts || {};
  opts.move_speed = UNIT_SPECS.SPEED.LOW;
  opts.init_health = UNIT_SPECS.HEALTH.HIGH;
  Unit.apply(this, arguments);
  this.unit_type = 'MedicUnit';
};

MedicUnit.prototype = Object.create(Unit.prototype);
MedicUnit.prototype.constructor = MedicUnit;
