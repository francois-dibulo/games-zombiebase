var HelicopterLanding = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
  this.body.moves = false;
};
HelicopterLanding.prototype = Object.create(Phaser.Sprite.prototype);
HelicopterLanding.prototype.constructor = HelicopterLanding;
