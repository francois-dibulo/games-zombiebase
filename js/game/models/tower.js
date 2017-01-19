var Tower = function () {
  Phaser.Sprite.apply(this, arguments);
};
Tower.prototype = Object.create(Phaser.Sprite.prototype);
Tower.prototype.constructor = Tower;
