var HelicopterLanding = function (game, x, y, key, frame) {
  Phaser.Sprite.apply(this, arguments);
  this.game = game;
  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
  this.body.moves = false;
};
HelicopterLanding.prototype = Object.create(Phaser.Sprite.prototype);
HelicopterLanding.prototype.constructor = HelicopterLanding;

HelicopterLanding.prototype.canHeliLand = function() {
  // TODO: return TRUE when no enemies, players or other helis are overlapping
  return true;
};
