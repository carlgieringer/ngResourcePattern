'use strict';

angular.module('ngResourcePattern.books')
.factory('Book', function(resourceSrv, Genre) {

  return resourceSrv.makeResource('/api/books/:id', {
    params: {
      id: '@id'
    },
    requestTransformer: function(book) {
      book.genre = book.genre.code;
      return book;
    },
    responseTransformer: function(book) {
      book.created = new Date(book.created);
      book.modified = new Date(book.modified);
      book.genre = new Genre(book.genre);
      return book;
    },
    prototype: {
      isFiction: function isFiction() {
        return !_.contains(['science, nonFiction'], this.genre.code);
      }
    },
    extraActions: {
      available: {
        isArray: true,
        params: {
          filter: "available"
        }
      }
    }
  });
});
