ScountEnemy = function (index, game, opts) {
  opts = opts || {};
  Enemy.apply(this, arguments);
  this.unit_type = 'ScountEnemy';
};

ScountEnemy.prototype = Object.create(Enemy.prototype);
ScountEnemy.prototype.constructor = ScountEnemy;
