SoldierUnit = function (index, game, opts) {
  opts = opts || {};
  opts.bullet_kill_distance = 100;
  Unit.apply(this, arguments);
};

SoldierUnit.prototype = Object.create(Unit.prototype);
SoldierUnit.prototype.constructor = SoldierUnit;
