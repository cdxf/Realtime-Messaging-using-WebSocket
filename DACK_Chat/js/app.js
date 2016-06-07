var app = angular.module('app')
    .controller('myCtrl', ['$scope','$state','chatService',function($scope,$stateParams,chatService) {
        $scope.newroom = function() {
            $scope.showform = !$scope.showform;
        };
        chatService.getRoom(function(r){
          $scope.rooms = r;
          for(var key in r){
            r[key].key = key;
          }
          console.log(r);
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
    })
    .factory('fire', ['$rootScope','chatService',function($rootScope,chatService) {
        var isLogged = false;
        var scopes = $rootScope.$new(true);
        var userData = null;
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyDvHa9x6iJSWxJymb-YNCPv2tOWXX1nH04",
            authDomain: "ptudwhcmus.firebaseapp.com",
            databaseURL: "https://ptudwhcmus.firebaseio.com",
            storageBucket: "ptudwhcmus.appspot.com",
        };
        firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              userData = user.providerData[0];
              user.getToken().then(function(token){
                  isLogged = true;
                  userData.token = token;
                  console.log("logging");
                  chatService.login(userData);
                  scopes.$emit('authChanged', userData);
              });

                // User is signed in.
            } else {
              isLogged = false;
              scopes.$emit('authChanged');
                // No user is signed in.
            }
        });
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('public_profile');

        function loginHandler(result) {
            console.log(result.user);
            // if (authData) {
            //     console.log("User " + authData.uid + " is logged in with " + authData.provider);
            //     isLogged = true;
            //     scopes.$emit('authChanged', authData);
            //     auth = authData;
            // } else {
            //     console.log("User is logged out");
            //     isLogged = false;
            //     scopes.$emit('authChanged');
            // }
        }

        function errorHandler(error) {
            console.log(error);
        }
        function logoutHandler() {
        }
        return {
            scope: scopes,
            userData: userData,
            isLogged: function() {
                return isLogged;
            },
            login: function() {
                firebase.auth().signInWithPopup(provider).then(loginHandler).catch(errorHandler);
            },
            logout: function() {
                firebase.auth().signOut().then(logoutHandler, errorHandler);
            }
        };
    }]);
