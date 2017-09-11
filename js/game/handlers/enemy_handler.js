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
      enemy = new Enemy(group.children.length, this.phaser, {x: 400, y: 400}, this.async_path);
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

      var new_target = null;
      var current_target = enemy.target_obj;

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
            if (current_target && current_target.name) {
              var prio_item = enemy.target_prio[item.name];
              var prio_current = enemy.target_prio[current_target.name];
              if (prio_item < prio_current) {
                new_target = item;
              }
            } else {
              new_target = item;
            }
            // Attack range
            if (distance <= enemy.attack_radius) {
              enemy.attack(item);
            }
          }
        }
      });

      // Collides with Unit
      var new_target_unit = null;
      units_group.forEach(function(unit) {
        if (unit.alive && unit.visible && enemy.alive) {
          var distance = Phaser.Math.distance(unit.x, unit.y, enemy.x, enemy.y);
          if (distance < enemy.view_radius) {
            if (!new_target_unit || (new_target_unit && unit.health < new_target_unit.health)) {
              new_target_unit = unit;
            }
          }
        }
      }, this);

      if (new_target_unit) {
        new_target = new_target_unit;
        enemy.abortClimbWall();
        enemy.stopTweenTo();
      }

      // else if (!new_target_unit || !new_target) {
      //   new_target = enemy.main_target_obj;
      // }

      // Has no current target
      if (enemy.main_target_obj && !new_target) {
        //
        var current_is_main = current_target ? current_target.name === enemy.main_target_obj.name : false;
        console.log(current_target)
        if (current_is_main) {
          var overlaps = this.phaser.physics.arcade.overlap(enemy, enemy.main_target_obj);
          if (overlaps && !enemy.overlaps_main_target) {
            new_target = null;
            enemy.moveToMainTarget();
            enemy.overlaps_main_target = true;
          } else if (!overlaps && enemy.overlaps_main_target) {
            new_target = enemy.main_target_obj;
            enemy.overlaps_main_target = false;
          }
          //enemy.overlaps_main_target = overlaps;
        } else {
          new_target = enemy.main_target_obj;
        }


        // var current_is_main = current_target ? current_target.name === enemy.main_target_obj.name : false;
        // if (current_target && current_is_main) {
        //   // Collides with main target

        //   if (overlaps && !enemy.overlaps_main_target) {
        //     enemy.moveToMainTarget();
        //     new_target = null;
        //     enemy.overlaps_main_target = true;
        //   }

        // } else if (!enemy.overlaps_main_target) {
        //   new_target = enemy.main_target_obj;
        // }

        // if (!current_is_main && enemy.overlaps_main_target === true && !overlaps) {
        //   if (current_target) {
        //     console.log(1, current_target.name)
        //   }
        //   new_target = enemy.main_target_obj;
        //   enemy.overlaps_main_target = false;
        // }

        //enemy.overlaps_main_target = overlaps;
      }

      enemy.setTargetObj(new_target);
    }, this);

  }

};
