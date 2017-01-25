RunnerEnemy = function (index, game, opts) {
  opts = opts || {};
  Enemy.apply(this, arguments);
  this.unit_type = 'RunnerEnemy';
};

RunnerEnemy.prototype = Object.create(Enemy.prototype);
RunnerEnemy.prototype.constructor = RunnerEnemy;
