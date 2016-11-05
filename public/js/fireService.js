angular.module('app')
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
              chatService.login(userData);
              onSuccess = chatService.scope.$on('loginSuccess',function(e,data){
                  scopes.$emit('authChanged', userData);
                  console.log("logging");
                  //destroy
                  onSuccess();
              });
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
