var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
   $scope.newroom = function(){
   	$scope.showform = !$scope.showform;
   } 
   $scope.saveroom = function(){
   	$scope.showform = !$scope.showform;
   }
});