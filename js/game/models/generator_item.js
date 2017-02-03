GeneratorItem = function (game, x, y, key, frame) {
  Item.apply(this, arguments);
  this.name = 'Generator';

  this.maxHealth = 100;
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

GeneratorItem.prototype.onHit = function(obj) {
  if (!this.alive) return;
  var damage = obj.attack_damage || 1;
  var label = this.health + '%';
  if (this.health > 1) {
    this.damage(damage);
  } else {
    this.alive = false;
    label = "BROKEN";
  }
  this.label.text = label;
};
