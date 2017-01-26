var EnemyHandler = function(phaser, groups, async_path) {
  this.phaser = phaser;
  this.groups = groups;
  this.async_path = async_path;
};

EnemyHandler.prototype = {

  getGroup: function() {
    return this.groups['enemy'];
  },

  createEnemy: function() {
    var group = this.getGroup();
    var enemy = group.getFirstDead();
    if (!enemy) {
      enemy = new Enemy(group.children.length, this.phaser, {}, this.async_path);
      group.add(enemy);
    } else {
      item.reset();
    }
    return enemy;
  },

  update: function(enemies_group, groups) {
    var units_group = groups['unit'];
    var main_target = groups['helicopter_landing'].children[0];

    this.phaser.physics.arcade.collide(enemies_group, enemies_group);

    enemies_group.forEach(function(enemy) {

      // Collides with Unit
      units_group.forEach(function(unit) {
        if (unit.alive && unit.visible && enemy.alive) {
          var distance = Phaser.Math.distance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < enemy.view_radius &&
            ((enemy.target_obj && enemy.target_obj.device_id !== unit.device_id) || !enemy.target_obj )) {
            enemy.moveTo(unit);
          }
          if (distance > enemy.view_radius * 2 &&
              (enemy.target_obj && enemy.target_obj.device_id === unit.device_id)) {
            enemy.moveTo(main_target);
          }
        }
      }, this);

      // Move to main object if it has no target
      if (!enemy.target_obj) {
        // enemy.calculatePathToObj(target);
        var closest_wp = null;
        if (!closest_wp) {
          closest_wp = main_target;
        }
        enemy.moveTo(closest_wp);
      }
    }, this);

  }

};
