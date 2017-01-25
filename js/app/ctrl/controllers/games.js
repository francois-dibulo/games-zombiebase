App.controllers.controller('GamesCtrl', ['$scope', '$location', 'ViewService', 'AirConsoleService', function ($scope, $location, ViewService, AirConsoleService) {

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

  $scope.goToModeSelection = function() {
    ViewService.ctrl.go('select_mode', true);
  };

  $scope.init = function() {
  };

  $scope.gameOver = function() {
    ViewService.ctrl.go('game_over', true);
  };

}]);
