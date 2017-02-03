Enemy = function (index, game, opts, async_path) {
  opts = opts || {};
  var x = opts.x || game.world.randomX;
  var y = opts.y || game.world.randomY;
  this.game = game;
  this.async_path = async_path;
  this.radius = 8;
  this.view_radius = Phaser.Math.between(50, 100);
  this.view_radius_circle = new Phaser.Circle(x, y, this.view_radius);

  Phaser.Sprite.call(this, game, x, y, 'enemy');

  this.anchor.setTo(0.5, 0.5);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setCircle(this.radius);
  this.body.maxVelocity = 1;
  this.body.immovable = false;
  this.body.collideWorldBounds = false;

  this.body.maxAngular = 300;
  this.move_speed = Phaser.Math.between(5, 20);
  this.is_stop = true;
  this.angular_move_velocity = 100;
  this.setHealth(3);

  this.overlaps_main_target = false;
  this.main_target_obj = null;
  this.target_obj = null;
  this.tween_to = null;

  this.target_prio = {
    'Unit': 0,
    'Generator': 1
  };
  this.attack_lock = null;
  this.attack_rate = 1000;
  this.attack_radius = this.radius + 2;
  this.attack_damage = 1;

  this.can_climbe = true;
  this.climb_wall_time = Phaser.Math.between(15, 60) * 1000;
  this.pass_wall_collide = false;
  game.add.existing(this);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  if (this.target_obj) {
    if (this.target_obj.alive) {
      this.game.physics.arcade.moveToObject(this, this.target_obj, this.move_speed);
      this.rotation = this.game.physics.arcade.angleToXY(this, this.target_obj.x, this.target_obj.y);
    } else {
      this.target_obj = null;
    }
  }
};

Enemy.prototype.onHit = function(bullet) {
  this.damage(1);
  console.log("HIT", this.health);
  return this.health === 0;
};

Enemy.prototype.setTargetObj = function(obj) {
  this.target_obj = obj;
};

Enemy.prototype.moveToPoint_ = function(x, y) {
  this.target_obj = null;
  if (this.tween_to) {
    this.stopTweenTo();
  }
  //
  var distance = Phaser.Math.distance(this.x, this.y, x, y);
  var duration = Math.round(this.move_speed * distance * 10);
  //
  this.tween_to = this.game.add.tween(this).to( { y: y, x: x }, duration, Phaser.Easing.Linear.In, true);
  this.rotation = this.game.physics.arcade.angleToXY(this, x, y);
  this.tween_to.onComplete.add(function() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }, this);
};

Enemy.prototype.stopTweenTo = function() {
  if (this.tween_to) {
    this.tween_to.stop();
  }
};

Enemy.prototype.moveToMainTarget = function() {
  //TODO: here we can use either direct path or path calculated by pathfinding
  var radius = Phaser.Math.between(5, this.main_target_obj.width);
  var angle = Phaser.Math.between(0, 360);
  var rad = Phaser.Math.degToRad(angle);
  var x = this.main_target_obj.x + Math.cos(rad) * radius;
  var y = this.main_target_obj.y + Math.sin(rad) * radius;
  this.moveToPoint_(x, y);
};

Enemy.prototype.attack = function(obj) {
  if (!obj.onHit) return;
  var now = new Date().getTime();
  var can_attack = now > this.attack_lock + this.attack_rate;
  if (!this.attack_lock ||
      (this.attack_lock && can_attack)) {
    this.attack_lock = now;
    obj.onHit(this);
  }
};

Enemy.prototype.collidesWithWall = function(wall) {
  if (!this.collide_wall_timeout && (Math.abs(this.body.velocity.x) < 2 && Math.abs(this.body.velocity.y) < 2)) {
    console.log("START TIMER", this.climb_wall_time);
    this.collide_wall_timeout = this.game.time.events.add(this.climb_wall_time, this.climbWall, this);
  }
};

Enemy.prototype.abortClimbWall = function() {
  if (this.collide_wall_timeout) {
    console.log("ABORT TIMER");
    this.game.time.events.add(200, function() {
      this.game.time.events.remove(this.collide_wall_timeout);
      this.collide_wall_timeout = null;
    }, this);
  }
};

Enemy.prototype.climbWall = function() {
  this.pass_wall_collide = true;
  this.collide_wall_timeout = null;
  var tween = this.game.add.tween(this.scale).to( { x: 1.2, y: 1.2 }, 400, Phaser.Easing.Back.Out, true, 0);
};

Enemy.prototype.leaveWall = function() {
  console.log("LEAVE WALL");
  this.abortClimbWall();
  this.pass_wall_collide = false;
  var tween = this.game.add.tween(this.scale).to({ x: 1, y: 1 }, 400, Phaser.Easing.Back.In, true, 0);
};

Enemy.prototype.calculatePathToObj = function(obj) {
  var Block = {
    Origin: this,
    Destination: obj,
    Diagonals: true,
    debugpath: false,
    found: function(path) {
      console.log(path);
    },
    notfound: function() {
      console.log('No path found');
    }
  };
  this.async_path.getPath(Block);
};
