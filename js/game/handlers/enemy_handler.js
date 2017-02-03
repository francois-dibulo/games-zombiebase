var EnemyHandler = function(phaser, groups, async_path) {
  this.phaser = phaser;
  this.groups = groups;
  this.async_path = async_path;
};

EnemyHandler.prototype = {

  getGroup: function() {
    return this.groups['enemy'];
  },

  createEnemy: function(main_target_obj) {
    var group = this.getGroup();
    var enemy = group.getFirstDead();
    if (!enemy) {
      enemy = new Enemy(group.children.length, this.phaser, {}, this.async_path);
      group.add(enemy);
    } else {
      item.reset();
    }

    if (main_target_obj) {
      enemy.main_target_obj = main_target_obj;
    }

    return enemy;
  },

  update: function(enemies_group, groups, map_layer) {
    var units_group = groups['unit'];
    var self = this;

    var collide = this.phaser.physics.arcade.collide.bind(this.phaser.physics.arcade);

    collide(enemies_group, enemies_group);
    collide(enemies_group, groups['tower']);
    collide(enemies_group, groups['item']);

    enemies_group.forEach(function(enemy) {

      var current_target = null;

      // Collides with wall tile? Climb it
      if (enemy.can_climbe) {
        var is_touching_wall = false;
        collide(enemy, map_layer, function(enemy, item) {
          enemy.collidesWithWall(item);
        }, function(enemy, item) {
          var state = false;
          if (item.properties.type === 'wall' && item.properties.can_climbe) {
            is_touching_wall = true;
            if (enemy.pass_wall_collide === false) {
              state = true;
            }
          } else {
            state = true;
          }
          return state;
        });

        if (!is_touching_wall && enemy.pass_wall_collide === true) {
          enemy.leaveWall();
        }
      } else {
        collide(enemy, map_layer);
      }

      // View Collides with Item
      groups['item'].forEach(function(item) {
        if (item.alive && item.visible) {
          var distance = Phaser.Math.distance(item.x, item.y, enemy.x, enemy.y);
          if (distance < enemy.view_radius) {
            if (enemy.target_obj && enemy.target_obj.name) {
              var prio_item = enemy.target_prio[item.name];
              var prio_current = enemy.target_prio[enemy.target_obj.name];
              if (prio_item < prio_current) {
                current_target = item;
              }
            } else {
              current_target = item;
            }
            // Attack range
            if (distance <= enemy.attack_radius) {
              enemy.attack(item);
            }
          }
        }
      });

      // Collides with Unit
      units_group.forEach(function(unit) {
        if (unit.alive && unit.visible && enemy.alive) {
          var distance = Phaser.Math.distance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < enemy.view_radius) {
            var is_following_unit = (enemy.target_obj && enemy.target_obj.name === "Unit");
            var new_unit_has_prio = false;
            if (is_following_unit) {
              new_unit_has_prio = enemy.target_obj.health > unit.health;
              // console.log(enemy.target_obj.health, unit.health);
            }
            if (!enemy.target_obj || new_unit_has_prio || !is_following_unit) {
              current_target = unit;
              enemy.abortClimbWall();
              enemy.stopTweenTo();
            }
          }
          if (!current_target && distance > enemy.view_radius &&
              (enemy.target_obj && enemy.target_obj.device_id === unit.device_id)) {
            current_target = enemy.main_target_obj;
          }
        }
      }, this);

      // Has no current target
      if (enemy.main_target_obj && !enemy.target_obj) {
        if (!current_target) {
          //
          var overlaps = false;
          // Collides with main target
          this.phaser.physics.arcade.overlap(enemy, enemy.main_target_obj, function(enemy, main_obj) {
            overlaps = true;
          });
          if (overlaps) {
            if (!enemy.overlaps_main_target) {
              enemy.moveToMainTarget();
            }
            current_target = null;
          } else {
            current_target = enemy.main_target_obj;
          }
          enemy.overlaps_main_target = overlaps;
        }
      }

      enemy.setTargetObj(current_target);
    }, this);

  }

};
