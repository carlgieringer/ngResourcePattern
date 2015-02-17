"use strict";

var m = angular.module('ngResourcePattern.services');
m.factory('resourceSrv', function($resource, $log) {

  return {
    makeResource: makeResource
  };

  /**
  * Creates a resource service with standardized behavior and actions.
  *
  * - Adds an $update action using PUT http method
  * - Constructs actions using {@link makeAction} for standardized behavior
  * @param {string} url - The `url` parameter for $resource
  * @param {object=} options - additional options for resource creation, containing any of:
  *   - params The `paramDefaults` parameter for $resource
  *   - responseTransformer function for transforming an entity from the server
  *   - requestTransformer function for transforming an entity for the server
  *   - extraActions Additional actions to pass to $resource.  Each key's value should be constructed using {@link makeAction}
  *   - options The `options` parameter passed to $resource
  *   - prototype The prototype of the resource constructor
  */
  function makeResource(url, options) {
    options = options || {};
    var actions = {
      get: makeAction({
        method: 'GET',
        responseTransformer: options.responseTransformer
      }),
      query: makeAction({
        method: 'GET',
        isArray: true,
        responseTransformer: options.responseTransformer
      }),
      save: makeAction({
        method: 'POST',
        responseTransformer: options.responseTransformer,
        requestTransformer: options.requestTransformer
      }),
      update: makeAction({
        method: 'PUT',
        responseTransformer: options.responseTransformer,
        requestTransformer: options.requestTransformer
      })
    };
    _.extend(actions, _.map(options.extraActions, function(extraAction) {
      return makeAction(copyWithTransformers(extraAction, options));
    }));

    var Resource = $resource(url, options.params, actions, options.options);

    angular.extend(Resource.prototype, options.prototype);

    return Resource;
  }

  function copyWithTransformers(action, options) {
    var copy = angular.copy(action);
    var method = copy.method || 'GET';
    switch (method) {
      case 'GET':
        copy.responseTransformer = options.responseTransformer;
        break;

      case 'POST':
      case 'PUT':
        copy.responseTransformer = options.responseTransformer;
        copy.requestTransformer = options.requestTransformer;
        break;

      case 'DELETE':
        break;

      default:
        $log.warn("Unknown HTTP method: " + method);
        copy.responseTransformer = options.responseTransformer;
        break;
    }
    return copy;
  }

  /*
  * Creates a resource action with standardized behavior for the response/request transformers, if defined.
  * - Ensures that responses are JSON
  * - Skips transformers when response data is an error object
  * - Copies request data so that the transformer cannot invalidate the object (causing form errors to flash while request is pending.)
  */
  function makeAction(options) {
    var action = {};

    if (options.method) {
      action.method = options.method;
    }
    if (options.isArray) {
      action.isArray = options.isArray;
    }
    if (options.params) {
      action.params = options.params;
    }
    if (options.requestTransformer) {
      action.transformRequest = makeRequestTransformer(options.requestTransformer);
    }
    if (options.responseTransformer) {
      action.transformResponse = makeResponseTransformer(options.responseTransformer);
    }

    return action;
  }

  function makeResponseTransformer(responseTransformer) {
    return function generatedResponseTransformer(data) {
      // The API should always return JSON
      try {
        data = angular.fromJson(data);
      } catch (err) {
        throw new Error("API response is not JSON: " + data);
      }
      // Just assume that the data should be transformed; if we wanted to ensure this we could pass isArray into this method
      return _.isArray(data) ? _.map(data, responseTransformer) : responseTransformer(data);
    };
  }

  function makeRequestTransformer(requestTransformer) {
    return function generatedRequestTransformer(data) {
      // Create a copy so that the transformer doesn't invalidate the existing object
      var copy = angular.copy(data);
      var transformed = requestTransformer(copy);
      return angular.toJson(transformed);
    };
  }
});
