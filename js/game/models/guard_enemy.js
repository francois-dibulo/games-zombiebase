GuardEnemy = function (index, game, opts) {
  opts = opts || {};
  Enemy.apply(this, arguments);
  this.unit_type = 'GuardEnemy';
};

GuardEnemy.prototype = Object.create(Enemy.prototype);
GuardEnemy.prototype.constructor = GuardEnemy;
