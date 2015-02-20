'use strict';

/**
 * @ngdoc overview
 * @name ratemycoopApp
 * @description
 * # ratemycoopApp
 *
 * Main module of the application.
 */
angular
  .module('ratemycoopApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });