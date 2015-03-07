'use strict';

/**
 * @ngdoc overview
 * @name ngscheduleApp
 * @description
 * # ngscheduleApp
 *
 * Main module of the application.
 */
angular
  .module('ngscheduleApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngSchedule'
  ])
  .config(function ($routeProvider) {
    // $routeProvider
    //   .when('/', {
    //     templateUrl: 'views/main.html',
    //     controller: 'MainCtrl'
    //   })
    //   .when('/about', {
    //     templateUrl: 'views/about.html',
    //     controller: 'AboutCtrl'
    //   })
    //   .otherwise({
    //     redirectTo: '/'
    //   });
  });
