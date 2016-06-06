var app = angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('');

        $stateProvider
            .state('index', {
                url: '',
                templateUrl: 'template/index.html',
                controller: 'myCtrl'
            })
            .state('room', {
                url: '/room',
                templateUrl: 'template/room.html',
                controller: ''
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'template/contact.html',
                controller: ''
            })
            .state('user', {
                url: '/user',
                templateUrl: 'template/user.html',
                controller: ''
            });
    }])
    .controller('myCtrl', ['$scope','chatService',function($scope,chatService) {
        $scope.newroom = function() {
            $scope.showform = !$scope.showform;
        };
        $scope.saveroom = function() {
            $scope.showform = !$scope.showform;
        };
    }])
    .directive('customnav', function(fire) {
        return {
            templateUrl: 'template/navbar.html',
            scope: {
                active: '@active'
            },

            link: function(scope, element, attrs) {
                console.log(scope.active);
                scope.hightlight = function(e) {
                    console.log("ok0");
                    console.log(e);
                };
                scope.isLogged = fire.isLogged();
                fire.scope.$on('authChanged', function(e, data) {
                  console.log(data);
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
    .factory('fire', function($rootScope) {
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
                  userData.token = token;
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
    });
