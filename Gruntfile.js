'use strict';
/* global module:false, require:false */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      server: 'node server.js',
    },
    jshint: {
      // http://www.jshint.com/docs/options/
      options: {
        freeze: true, // Prohibit overwriting built-in objects' prototype methods
        immed: true, // Require wrapping IIFEs in parens
        globalstrict: true, // Don't use in production unless you handle with your build process (can cause strict mode to apply to third-party code.)
        latedef: 'nofunc', // Require variable declaration before use.  (But allow function declaration after use.)
        newcap: true, // Require capitalization of constructor functions
        noarg: true, // Prohibit using arguments.caller/.callee
        noempty: true, // Prohibit empty blocks
        nonbsp: true, // Prohibit non-breaking spaces
        nonew: true, // Require assignment of newed functions/constructors
        undef: true, // Prohibit using implicitly declared variables
        unused: 'vars', // Prohibit unused variables (But allow unused parameters.)
        strict: true, // ECMAScript 5 strict mode
        trailing: false, // Allow trailing whitespace.  Beware can break multi-line string literals.  IDEs or other processes should remove these.
        smarttabs: true, // Allow mixing spaces and tabs for indentation/alignment purposes

        globals: {
          // false means the global is read-only
          angular: false,
          _: false,
        },
      },
      server: {
        src: 'server.js',
      },
      client: {
        options: {
          // es3: true, // Adhere to ECMAScript 3 for IE 6/7/8/9 (Enable in real-world)
        },
        src: 'client/**/*.js',
      },
      gruntfile: {
        src: 'Gruntfile.js',
      },
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('server', [
    'jshint:gruntfile',
    'jshint:server',
    'jshint:client',
    'exec:server',
  ]);

  grunt.registerTask('default', ['server']);
};
