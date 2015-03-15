/*global module:false*/
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    // Metadata, loaded from package.json.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n',

    // Task configuration.
    watch: {
      project: {
        files: '<%= jshint.project %>',
        tasks: ['jshint'],
        options: {
          livereload: 35729
        }
      },
      projectHtml: {
        files: [ 'index.html' ],
        options: {
          livereload: 35729
        }
      }
    },
    jshint: {
      options: {
        predef: ['angular'],
        bitwise: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        freeze: true,
        immed: true,
        indent: 4,
        noempty: true,
        nonbsp: true,
        newcap: false,
        eqnull: true,
        browser: true,
        strict: false,
        trailing: true,
        laxcomma: false,
        quotmark: 'single',
        globals: {
          angular: true
        },
        reporter: require('jshint-stylish')

      },
      project: [ 'js/**/*.js' ]
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask( 'hint', [ 'jshint' ] );

  // Default task(s). These tasks are run whenever grunt is called from the command line.
  grunt.registerTask('default', ['watch']);

};