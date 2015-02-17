'use strict';

angular.module('ngResourcePattern.books')
.controller('BookCtrl', function($routeParams, $location, Book, Genre) {
  var ctrl = this;

  ctrl.book = Book.get({id: $routeParams.id}, function(book) {
    ctrl.updatedBook = new Book(book);
  });
  ctrl.genres = Genre.all;
  ctrl.updateBook = updateBook;
  ctrl.deleteBook = deleteBook;

  function updateBook() {
    ctrl.updatedBook.$update(
      function(book) {
        ctrl.book = book;
        ctrl.updatedBook = new Book(book);
      });
  }

  function deleteBook() {
    ctrl.book.$delete(function() {
      $location.url('/books');
    });
  }
});
