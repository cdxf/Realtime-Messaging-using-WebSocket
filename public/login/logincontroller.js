/**
 * Created by HoaiPhu on 6/6/2016.
 */
var myapp = angular.module('AppLogin', []);
myapp.controller('myCtrlLogin', function($scope) {
    var ref = new Firebase("https://01chatgroupp2q.firebaseio.com");
    $scope.Login=function () {
        ref.authWithOAuthPopup("facebook", function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                window.location.href = "../index.html";
            }

        });
    }
    $scope.Logout=function () {
        ref.unauth();
    }
});