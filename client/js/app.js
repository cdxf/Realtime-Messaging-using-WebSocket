var app = angular.module('app')
    .controller('user', ['$scope','chatService','fire',function($scope,chatService,fire){
        chatService.requestOnlineUsers();
        OnlineUsers = chatService.scope.$on('OnlineUsers',function(e,data){
            $scope.users = data;
            $scope.$apply();
        });
          $scope.$on('$destroy',OnlineUsers);
    }])
    .controller('myCtrl', ['$scope','$state','chatService','fire',function($scope,$stateParams,chatService,fire) {
      $scope.isLogged = fire.isLogged();
      fire.scope.$on('authChanged', function(e, data) {
          $scope.isLogged = fire.isLogged();
          if (data !== undefined) {
              $scope.isLogged = fire.isLogged();
              $scope.$apply();
          }
          if ($scope.isLogged === true) $scope.$apply();
      });
        $scope.newroom = function() {
            $scope.showform = !$scope.showform;
        };
        chatService.getRoom(function(r){
          $scope.rooms = r;
          for(var key in r){
            r[key].key = key;
          }
          $scope.$apply();
        })
        $scope.saveroom = function() {
            console.log($scope);
            $scope.showform = !$scope.showform;
            console.log(chatService.user);
            json = {
              title: $scope.title,
              author: chatService.user,
              token: chatService.user.token
            }
            chatService.createRoom(json);
        };
    }])
    .directive('customnav', function(fire,$state) {
        return {
            templateUrl: 'template/navbar.html',
            scope: {
            },

            link: function(scope, element, attrs) {
                //scope.active = $state.current.name;
                console.log($state.current);
                scope.hightlight = function(e) {
                    console.log(e);
                };
                scope.isLogged = fire.isLogged();
                fire.scope.$on('authChanged', function(e, data) {
                    scope.isLogged = fire.isLogged();
                    if (data !== undefined) {
                        scope.isLogged = fire.isLogged();
                        scope.username = data.displayName;
                        scope.avatar = data.photoURL;
                        scope.$apply();
                    }
                    if (scope.isLogged === true) scope.$apply();
                });
                scope.login = fire.login;
                scope.logout = fire.logout;
            }
        };
    })
    .directive('ngfooter', function() {
        return {
            templateUrl: 'template/footer.html',
            scope: {
                active: '@active'
            }
        };
    });
