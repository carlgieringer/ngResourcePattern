'use strict';

describe('resourceSrv', function() {
  var srv,
    url = '/the-url',
    $resource = jasmine.createSpy('$resource'),
    Resource = { prototype: {} },
    result;

  function calledWithStandardActions() {
    var actions = $resource.calls.mostRecent().args[2];
    expect(actions.get).toBeTruthy();
    expect(actions.query).toBeTruthy();
    expect(actions.save).toBeTruthy();
    expect(actions.update).toBeTruthy();
    expect(actions.delete).toBeTruthy();
    expect(actions.remove).toBeTruthy();
  }

  beforeEach(function() {
    module('ngResourcePattern');
    module(function($provide) {
      $provide.value('$resource', $resource);
    });
    inject(function(resourceSrv) {
      srv = resourceSrv;
      $resource.and.returnValue(Resource);
    });
  });

  describe('when making a resource', function() {
    beforeEach(function() {
      result = srv.makeResource(url);
    });

    it('should create a Resource', function() {
      expect($resource.calls.count()).toBe(1);
    });
    it('should pass the URL', function() {
      expect($resource.calls.mostRecent().args[0]).toBe(url);
    });
    it('should pass standard actions', calledWithStandardActions);
    it('should return the resource', function() {
      expect(result).toBe(Resource);
    });
  });

  describe('when making a resource with additional prototype methods', function() {
    var methods = {
      someMethod: someMethod
    };

    function someMethod() {}

    beforeEach(function() {
      result = srv.makeResource(url, {
        prototype: methods
      });
    });

    it('should have the methods', function() {
      expect(result.prototype.someMethod).toBe(someMethod);
    });
  });

  describe('when making a resource with extra actions', function() {
    var anAction = {},
      anotherAction = {
        method: 'POST'
      };
    beforeEach(function() {
      result = srv.makeResource(url, {
        extraActions: {
          anAction: anAction,
          anotherAction: anotherAction
        }
      });
    });

    it('should pass the extra actions', function() {
      var actions = $resource.calls.mostRecent().args[2];
      expect(_.isEqual(actions.anAction, anAction)).toBe(true);
      expect(_.isEqual(actions.anotherAction, anotherAction)).toBe(true);
    });
    it('should still pass the standard actions', calledWithStandardActions);
  });

  describe('when making a resource with default params', function() {
    var paramDefaults = {};
    beforeEach(function() {
      result = srv.makeResource(url, {
        params: paramDefaults
      });
    });

    it('should pass them', function() {
      expect($resource.calls.mostRecent().args[1]).toBe(paramDefaults);
    });
  });

  describe('when making a resource with additional options', function() {
    var additionalOptions = {};
    beforeEach(function() {
      result = srv.makeResource(url, {
        options: additionalOptions
      });
    });

    it('should pass them', function() {
      expect($resource.calls.mostRecent().args[3]).toBe(additionalOptions);
    });
  });

  describe('when making a resource with transformers', function() {
    function requestTransformer() {}
    function responseTransformer() {}
    var anAction = {},
      anotherAction = { method: 'POST' };

    beforeEach(function() {
      result = srv.makeResource(url, {
        requestTransformer: requestTransformer,
        responseTransformer: responseTransformer,
        extraActions: {
          anAction: anAction,
          anotherAction: anotherAction
        }
      });
    });

    it('should add them to standard actions', function() {
      var actions = $resource.calls.mostRecent().args[2];
      expect(typeof actions.get.transformResponse).toBe('function');

      expect(typeof actions.query.transformResponse).toBe('function');

      expect(typeof actions.save.transformRequest).toBe('function');
      expect(typeof actions.save.transformResponse).toBe('function');

      expect(typeof actions.update.transformRequest).toBe('function');
      expect(typeof actions.update.transformResponse).toBe('function');
    });

    it('should add them to extra actions', function() {
      var actions = $resource.calls.mostRecent().args[2];
      expect(typeof actions.anAction.transformResponse).toBe('function');

      expect(typeof actions.anotherAction.transformRequest).toBe('function');
      expect(typeof actions.anotherAction.transformResponse).toBe('function');
    });

  });

});
