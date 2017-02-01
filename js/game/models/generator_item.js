GeneratorItem = function (game, x, y, key, frame) {
  Item.apply(this, arguments);
  this.name = 'Generator';

  this.init_health = 40;
  this.setHealth(this.init_health);

  var style = { font: "12px Courier", fill: "#00FF00", boundsAlignH: "center" };
  this.label = game.add.text(0, 0, this.health + "%", style);
};

GeneratorItem.prototype = Object.create(Item.prototype);
GeneratorItem.prototype.constructor = GeneratorItem;

GeneratorItem.prototype.update = function() {
  this.label.alignTo(this, Phaser.TOP_CENTER);
};

GeneratorItem.prototype.attacked = function() {
  this.label.text = this.health + '%';
};
