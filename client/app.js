'use strict';

angular.module('ngResourcePattern', [
  'ngResource',
  'ngRoute',
  'ngResourcePattern.books',
  'ngResourcePattern.users',
  'ngResourcePattern.services',
])
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'assets/home/home.html',
    })
    .when('/books/:id', {
      templateUrl: 'assets/books/book.html',
    })
    .when('/books', {
      templateUrl: 'assets/books/books.html',
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
