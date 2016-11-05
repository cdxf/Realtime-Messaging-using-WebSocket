angular.module('app', ['ui.router'])
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
            controller: 'myCtrl'
        })
        .state('roomchat', {
            url: '/roomchat/:id',
            templateUrl: 'template/chat.html',
            controller: ''
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'template/contact.html',
            controller: ''
        })
        .state('chat', {
            url: '/chat',
            templateUrl: 'template/chat.html',
            controller: ''
        })
        .state('user', {
            url: '/user',
            templateUrl: 'template/user.html',
            controller: 'user'
        });
}])
