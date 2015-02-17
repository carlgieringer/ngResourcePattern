'use strict';

angular.module('ngResourcePattern.users')
.factory('User', function($resource) {
  // TODO missing $update method
  return $resource('/api/users/:id', {
    id: '@id'
  });
});
