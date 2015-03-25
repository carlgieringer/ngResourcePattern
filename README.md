# ngResourcePattern

An application exemplifying a DRY pattern for using AngularJS ngResource with RESTful entities.  The pattern is encapsulated in [resourceSrv.js](https://github.com/carlgieringer/ngResourcePattern/blob/master/client/resourceSrv.js) which exposes a single method `makeResource` for creating AngularJS Resources.  Some of the benefits of using this method/pattern are that it is DRY to apply the same response and request transformers to all of your Resource actions and easy to add methods to the prototypes of your Resource instances.  Using a service such as this one provides a single place where you can perform error handling and other global handlers/optimizations on your Resources.

```JavaScript
/**
 * Creates a Resource with standardized behavior and actions.
 *
 * Adds an $update action using PUT HTTP method. Adds request/responseTransformer as appropriate
 * for the HTTP method to all actions (built-in and extra.)
 *
 * @param {string} url - The `url` parameter for $resource
 * @param {object=} options - additional options for resource creation, containing any of:
 * - {object=} params - The `paramDefaults` parameter for $resource
 * - {function=} responseTransformer - function for transforming an entity from the server
 * - {function=} requestTransformer - function for transforming an entity for the server
 * - {object} extraActions - Additional actions to pass to $resource.
 * - {object} options - The `options` parameter passed to $resource
 * - {object.<string,function>} prototype - Additional methods to add to the Resource's prototype
 *
 * Note that currently the service overwrites transformers defined for extraActions with any defined
 * in options.
 */
 function makeResource(url, options) {
   // ...
 }
```

## Installation

After cloning you need to install dependencies:

```Shell
npm install
bower install
```

## Running dev server

Then you can run the the dev server at localhost:8080 with:

```Shell
grunt server
```

The dev server has basic static file capabilities and in-memory
storage of entities created.

## Tests

To run the tests in the console, do:

```Shell
grunt test
```

To run the tests in a browser for debugging, do:

```Shell
grunt debug
```

## TODOs

 - Use Browserify (right now the files are not IIFE'd and so are in the global scope)
 - Use usemin to reduce duplication between index.html's script tags and the Karma conf's script definitions
 - Add code coverage
