"use strict";

var DEFAULT_METHOD = 'GET';

var m = angular.module('ngResourcePattern.services');
m.factory('resourceSrv', function($resource, $log) {

  return {
    makeResource: makeResource
  };

  /**
   * Creates a Resource with standardized behavior and actions.
   *
   * Adds an $update action using PUT HTTP method.  Adds request/responseTransformer as appropriate
   * for the HTTP method to all actions (built-in and extra.)
   *
   * @param {string} url - The `url` parameter for $resource
   * @param {object=} options - additional options for resource creation, containing any of:
   *   - {object=} params - The `paramDefaults` parameter for $resource
   *   - {function=} responseTransformer - function for transforming an entity from the server
   *   - {function=} requestTransformer - function for transforming an entity for the server
   *   - {object} extraActions - Additional actions to pass to $resource.
   *   - {object} options - The `options` parameter passed to $resource
   *   - {object.<string,function>} prototype - Additional methods to add to the Resource's prototype
   *
   * Note that currently the service overwrites transformers defined for extraActions with any defined
   * in options.
   */
  function makeResource(url, options) {
    options = options || {};

    // Generate the transformers once for all actions
    var generatedTransformers = {
      request: options.requestTransformer && makeRequestTransformer(options.requestTransformer),
      response: options.responseTransformer && makeResponseTransformer(options.responseTransformer)
    };
    var builtInActions = {
      get: makeAction({}, generatedTransformers),
      query: makeAction({ isArray: true }, generatedTransformers),
      save: makeAction({ method: 'POST' }, generatedTransformers),
      update: makeAction({ method: 'PUT' }, generatedTransformers),
      'delete': makeAction({ method: 'DELETE' }, generatedTransformers),
      remove: makeAction({ method: 'DELETE' }, generatedTransformers)
    };
    var allActions = _.reduce(options.extraActions, function(combinedActions, action, name) {
      combinedActions[name] = makeAction(action, generatedTransformers);
      return combinedActions;
    }, builtInActions);

    var Resource = $resource(url, options.params, allActions, options.options);
    angular.extend(Resource.prototype, options.prototype);

    return Resource;
  }

  /**
   * Creates a resource action with standardized behavior for the response/request transformers
   * appropriate for the action's HTTP method
   */
  function makeAction(action, generatedTransformers) {
    var copy = angular.copy(action);

    var method = action.method || DEFAULT_METHOD;
    switch (method) {
      case 'GET':
        // Assumes that gets do not have payloads
        if (generatedTransformers.response) {
          copy.transformResponse = generatedTransformers.response;
        }
        break;

      case 'POST':
      case 'PUT':
        // POST and PUT both send and receive data
        if (generatedTransformers.response) {
          copy.transformResponse = generatedTransformers.response;
        }
        if (generatedTransformers.request) {
          copy.transformRequest = generatedTransformers.request;
        }
        break;

      case 'DELETE':
        // Assume that DELETEs neither send nor receive data
        break;

      default:
        $log.warn("Unknown HTTP method: " + method);
        if (generatedTransformers.response) {
          copy.transformResponse = generatedTransformers.response;
        }
        break;
    }

    return copy;
  }

  function makeResponseTransformer(responseTransformer) {
    return function generatedResponseTransformer(data) {
      // The API should always return JSON
      try {
        data = angular.fromJson(data);
      } catch (err) {
        throw new Error("API response is not JSON: " + data);
      }
      // Just assume that the data should be transformed; if we wanted to ensure that the correct JSON type was returned, we could pass isArray into this method
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
