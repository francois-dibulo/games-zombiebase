SoldierUnit = function (index, game, opts) {
  opts = opts || {};
  opts.bullet_kill_distance = 100;
  Unit.apply(this, arguments);
  this.unit_type = 'SoldierUnit';
};

SoldierUnit.prototype = Object.create(Unit.prototype);
SoldierUnit.prototype.constructor = SoldierUnit;
