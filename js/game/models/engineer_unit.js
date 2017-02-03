EngineerUnit = function (index, game, opts) {
  opts = opts || {};
  opts.move_speed = UNIT_SPECS.SPEED.HIGH;
  opts.bullet_kill_distance = UNIT_SPECS.BULLET_DISTANCE.LOW;
  opts.init_health = UNIT_SPECS.HEALTH.MEDIUM;
  Unit.apply(this, arguments);
  this.unit_type = 'EngineerUnit';
};

EngineerUnit.prototype = Object.create(Unit.prototype);
EngineerUnit.prototype.constructor = EngineerUnit;
