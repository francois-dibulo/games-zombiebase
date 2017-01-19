Unit = function (index, game, opts) {
  opts = opts || {};
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  var color = opts.color || "#00ff00";
  var dec_color = parseInt(color.substr(1), 16);
  this.game = game;
  this.radius = 8;

  var graphics = game.make.graphics(x, y);
  graphics.lineStyle(2, dec_color, 1);
  graphics.drawCircle(0, 0, this.radius);
  var texture = graphics.generateTexture();

  Phaser.Sprite.call(this, game, x, y, 'player');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity = 1;
  this.body.immovable = false;
  this.body.collideWorldBounds = true;

  this.body.maxAngular = 300;
  // this.body.angularDrag = 50;
  this.move_velocity = 0;
  this.is_stop = true;
  this.angular_move_velocity = 100;
  this.move = {
    left: false,
    right: false
  };

  game.add.existing(this);

  var style = { font: "10px Courier", fill: color };
  this.text1 = game.add.text(0, 0, opts.label || "Player", style);

  this.setHealth(3);

  // Creates 30 bullets, using the 'bullet' graphic
  this.weapon = game.add.weapon(30, 'bullet');
  this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
  this.weapon.bulletKillDistance = 150;
  this.weapon.fireLimit = 15;
  this.weapon.fireRate = 300;
  this.weapon.trackSprite(this, 0, 0, true);
  this.weapon.onFireLimit.add(this.onFireLimit.bind(this));
};

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.update = function() {
  this.text1.alignTo(this, Phaser.CENTER_TOP, 16);
  this.game.physics.arcade.velocityFromAngle(this.angle, this.move_velocity, this.body.velocity);
};

Unit.prototype.onFireLimit = function() {
  console.log("OUT OF AMMO");
};

Unit.prototype.onBulletHit = function() {
  this.damage(1);
  console.log("HIT", this.health);
};

Unit.prototype.onMove = function(data) {
  this.move = data;
  var is_both = data.left && data.right;
  this.body.angularVelocity = 0;
  if (is_both) {
    this.is_stop = !this.is_stop;
    this.move_velocity = this.is_stop ? 0 : 30;
  } else if (data.left) {
    this.body.angularVelocity = -this.angular_move_velocity;
  } else if (data.right) {
    this.body.angularVelocity = this.angular_move_velocity;
  }
};

Unit.prototype.onShoot = function(data) {
  this.weapon.fire();
};
