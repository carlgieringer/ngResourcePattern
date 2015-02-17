'use strict';

angular.module('ngResourcePattern.books')
.controller('BooksCtrl', function($scope, Book, Genre) {
  var ctrl = this;

  ctrl.books = Book.query();
  ctrl.genres = Genre.all;
  ctrl.newBook = new Book();
  ctrl.createBook = createBook;

  function createBook(form) {
    ctrl.newBook.$save(
      function(book) {
        ctrl.books.push(book);
        ctrl.newBook = new Book();
      }
    );
  }
});
