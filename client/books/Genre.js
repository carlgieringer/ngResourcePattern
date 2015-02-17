'use strict';

angular.module('ngResourcePattern.books')
.factory('Genre', function() {
  var propsByCode = {
    horror: {
      display: 'Horror',
    },
    fantasy: {
      display: 'Fantasy',
    },
    historicalFiction: {
      display: 'Historical Fiction',
    },
    scienceFiction: {
      display: 'Science Fiction',
    },
    nonFiction: {
      display: 'Non-fiction',
    },
    science: {
      display: 'Science',
    }
  };

  function Genre(code) {
    this.code = code;
    var props = propsByCode[code];
    _.extend(this, props);
  }

  Genre.all = _.map(propsByCode, function(props, code) {
    return new Genre(code);
  });

  return Genre;
});
