An application exemplifying a pattern for using AngularJS ngResource with RESTful entities.

After cloning you need to install dependencies:

    npm install
    bower install

Then you can run the the dev server at localhost:8080 with:

    grunt server

The dev server has basic static file capabilities and in-memory
storage of entities created.

To run the tests in the console, do:

    grunt test

To run the tests in a browser for debugging, do:

    grunt debug

TODOs:
 - Use Browserify (right now the files are not IIFE'd and so are in the global scope)
 - Use usemin to reduce duplication between index.html's script tags and the Karma conf's script definitions
 - Add code coverage