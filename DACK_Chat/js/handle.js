var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    var ref = new Firebase("https://01chatgroupp2q.firebaseio.com");
    $scope.Logout=function () {
        ref.unauth();
        console.log("Logout success!!!");
        window.location.href = "login/loginhtml.html";

    }
   $scope.newroom = function(){
   	$scope.showform = !$scope.showform;
   }
   $scope.saveroom = function(){
   	$scope.showform = !$scope.showform;
   }

});