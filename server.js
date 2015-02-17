'use strict';
/* jshint debug:true */
/* global require:false, console:false */

var http = require('http');
var fs = require('fs');
var url = require('url');

var port = 8080;
// Directories checked for static assets
var staticDirs = [
  'bower_components/',
  'client/',
];

// The in-memory store for our RESTful API
var entityStore = {};

function Response(status, contentType, content) {
  this.status = status;
  this.contentType = contentType;
  this.content = content;
}

function notFoundResponse(onResponse) {
  onResponse(new Response(404, 'text/plain', "Not found"));
}

// Try to retrieve an asset at `filepath` from staticDirs[index].  If there's
// an err, try the next index recursively
function getAsset(filepath, index, onResponse) {
  if (index >= staticDirs.length) {
    notFoundResponse(onResponse);
  } else {
    fs.readFile(staticDirs[index] + filepath, function(err, file) {
      if (err) {
        getAsset(filepath, index + 1, onResponse);
      } else {
        assetResponse(file, filepath, onResponse);
      }
    });
  }
}

// Return a blob to the client; use `filepath` to determine its content-type
function assetResponse(file, filepath, onResponse) {
  var contentType;
  var ext = filepath.substring(filepath.lastIndexOf('.'));
  switch(ext) {
    case '.js':
      contentType = 'application/javascript';
      break;
    case '.html':
      contentType = 'text/html';
      break;
    default:
      contentType = 'text/plain';
      break;
  }

  onResponse(new Response(200, contentType, file));
}

// Return entities to the client.  `entityId` may be falsy if the collection
// should be returned
function getEntities(entityName, entityId, onResponse) {
  var entity, entities = entityStore[entityName];
  if (!entities) {
    apiNotFoundResponse(onResponse);
  } else {
    if (entityId) {
      if (entities.length >= entityId) {
        entity = entities[entityId - 1];
        if (!entity) {
          apiNotFoundResponse(onResponse);
        } else {
          apiJsonResponse(entity, onResponse);
        }
      } else {
        apiNotFoundResponse(onResponse);
      }
    } else {
      apiJsonResponse(entities.filter(function(e) { return !!e; }), onResponse);
    }
  }
}

function createEntity(entityName, entity, onResponse) {
  var entities = entityStore[entityName];
  if (!entities) {
    entities = entityStore[entityName] = [];
  }
  entity.created = new Date().valueOf();
  entity.modified = entity.created;
  entities.push(entity);
  entity.id = entities.length;

  onResponse(new Response(200, 'application/json', JSON.stringify(entity)));
}

function updateEntity(entityName, entity, onResponse) {
  debugger;
  var entities = entityStore[entityName];
  if (!entities || entities.length < entity.id) {
    apiNotFoundResponse(onResponse);
  } else {
    if (!entities[entity.id - 1]) {
      apiNotFoundResponse(onResponse);
    } else {
      entities[entity.id - 1] = entity;
      entity.modified = new Date().valueOf();

      onResponse(new Response(200, 'application/json', JSON.stringify(entity)));
    }
  }
}

function deleteEntity(entityName, entityId, onResponse) {
  var entities = entityStore[entityName];
  if (!entities) {
    apiNotFoundResponse(onResponse);
  } else if (entities.length < entityId) {
    apiNotFoundResponse(onResponse);
  } else {
    entities[entityId - 1] = null;

    onResponse(new Response(200));
  }
}

// Return val as JSON
function apiJsonResponse(val, onResponse) {
  onResponse(new Response(200, 'application/json', JSON.stringify(val)));
}

function apiNotFoundResponse(onResponse) {
  onResponse(new Response(404));
}

function badRequest(message, onResponse) {
  onResponse(new Response(400, 'application/json', JSON.stringify({message: message})));
}

function collectData(req, onCollected) {
  var collected = '';
  req.on('data', function (data) {
    collected += data;
  });
  req.on('end', function () {
    onCollected(collected);
  });
}

/* Creates a simple testing server that serves static assets and stores API changes in-memory
 *
 * Endpoints:
 * /assets/path/to/file - Returns the contents of the first file in staticDirs at the path
 * /api/entities/id - Performs in-memory RESTful operations on the collection 'entities'
 * /anything-else - Returns index.html
 */
http.createServer(function (req, res) {
  var match, filepath, entityName, entityId, entity;

  function writeResponse(response) {
    console.log(response.status + " " + req.url);
    var headers = response.contentType ? {'Content-Type': response.contentType} : null;
    res.writeHead(response.status, headers);
    res.end(response.content);
  }

  var parts = url.parse(req.url);
  if (!!(match = /^\/assets\/(.*)/i.exec(parts.pathname))) {
    filepath = match[1];
    getAsset(filepath, 0, writeResponse);
  } else if (!!(match = /^\/api\/([^/]+)\/?([\d]{0,})/i.exec(parts.pathname))) {
    entityName = match[1];
    entityId = match.length > 1 ? parseInt(match[2], 10) : null;
    switch(req.method) {
      case 'GET':
        getEntities(entityName, entityId, writeResponse);
        break;
      case 'POST':
        collectData(req, function(data) {
          entity = JSON.parse(data);
          createEntity(entityName, entity, writeResponse);
        });
        break;
      case 'PUT':
        collectData(req, function(data) {
          entity = JSON.parse(data);
          updateEntity(entityName, entity, writeResponse);
        });
        break;
      case 'DELETE':
        if (!entityId) {
          badRequest("id is required when deleting", writeResponse);
        } else {
          deleteEntity(entityName, entityId, writeResponse);
        }
        break;
    }
  } else {
    fs.readFile('client/index.html', function(err, file) {
      if (err) throw err;
      assetResponse(file, 'client/index.html', writeResponse);
    });
  }
}).listen(port);

console.log("Server running at port " + port);
