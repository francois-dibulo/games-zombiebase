PilotUnit = function (index, game, opts) {
  opts = opts || {};
  opts.init_health = UNIT_SPECS.HEALTH.LOW;
  Unit.apply(this, arguments);
};

PilotUnit.prototype = Object.create(Unit.prototype);
PilotUnit.prototype.constructor = PilotUnit;
