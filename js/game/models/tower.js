var Tower = function () {
  Phaser.Sprite.apply(this, arguments);
};
Tower.prototype = Object.create(Phaser.Sprite.prototype);
Tower.prototype.constructor = Tower;

Tower.prototype.onMove = function(data) {

};

Tower.prototype.onShoot = function(data) {
  //this.weapon.fire();
};
