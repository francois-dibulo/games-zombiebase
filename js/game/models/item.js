// game, x, y, key, frame
var Item = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  game.physics.enable(this, Phaser.Physics.ARCADE);
  //this.anchor.setTo(0.5, 0.5);
  this.body.immovable = true;
  this.body.moves = false;
};
Item.prototype = Object.create(Phaser.Sprite.prototype);
Item.prototype.constructor = Item;

Item.prototype.update = function() {
};
