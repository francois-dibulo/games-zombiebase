App.controllers.controller('GamesCtrl', ['$scope', '$location', 'ViewService', 'AirConsoleService', 'PlayerService', function ($scope, $location, ViewService, AirConsoleService, PlayerService) {
  var airconsole = AirConsoleService.airconsole;
  var evts = {};
  var move = {
    left: false,
    right: false
  };

  var sendInputEvent = function(data) {
    AirConsoleService.airconsole.sendEvent(AirConsole.SCREEN, AirConsoleService.Event.GameInput, data);
  };

  var sendMoveEvent = function() {
    sendInputEvent({
      action: 'move',
      data: move
    });
  };

  $scope.onLeft = function(state) {
    move.left = state;
    sendMoveEvent();
  };

  $scope.onRight = function(state) {
    move.right = state;
    sendMoveEvent();
  };

  $scope.onAction = function(state) {
    sendInputEvent({
      action: 'shoot'
    });
  };

  $scope.onExit = function(state) {
    sendInputEvent({
      action: 'exit_vehicle'
    });
  };

  $scope.gameOver = function() {
    ViewService.ctrl.go('game_over', true);
  };

  $scope.goToModeSelection = function() {
    ViewService.ctrl.go('select_mode', true);
  };

  $scope.init = function() {

    evts.on_update_player = airconsole.on('on_update_player', function(device_id, params) {
      for (var prop in params) {
        $scope.player[prop] = params[prop];
      }
      console.log($scope.player);
      $scope.$apply();
    });

  };


  $scope.$on("$destroy", function() {
    for (var key in evts) {
      airconsole.off(evts[key]);
    }
  });

}]);
