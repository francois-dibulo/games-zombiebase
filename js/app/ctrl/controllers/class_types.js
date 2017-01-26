App.controllers.controller('ClassTypesCtrl', ['$scope', '$location', 'PlayerService', 'ViewService', function ($scope, $location, PlayerService, ViewService) {
  $scope.available_classes = UNITS;

  $scope.selectClass = function(class_obj) {
    $scope.player.class_type = class_obj.class_type;
    PlayerService.updatePlayerProperty("class_type", class_obj.class_type);
  };

  $scope.isSelectedClass = function(class_type) {
    return $scope.player.class_type === class_type;
  };

  $scope.startGame = function() {
    ViewService.ctrl.go('game', true);
  };

  $scope.init = function() {

  };

  $scope.$on("$destroy", function() {

  });

}]);
