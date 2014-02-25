'use strict';

var request = require('request');

module.exports = function (grunt) {
  var reloadPort = 35729, files;

  var jb2Config = {
    public : 'public'
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: jb2Config,
    develop: {
      server: {
        file: 'app.js'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['<%= config.public %>/js/*.js'],
        options: {
          livereload: reloadPort
        },
        tasks: ['concat','groundskeeper', 'uglify']
      },
      sass: {
          files: ['<%= config.public %>/{,*/}*.{scss,sass}'],
          tasks: ['sass', 'autoprefixer']
      },

      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: reloadPort
        },
      }
    },
    sass: {
        options: {
            style: 'expanded',
        },
        dist: {
          files: {
            '<%= config.public %>/css/main.css': '<%= config.public %>/sass/main.scss'
          }
        }
    },

    concat: {
      options: {
      },
      dist: {
        src: [
          'public/components/jquery/jquery.js',
          'public/components/underscore/underscore.js',
          'public/components/backbone/backbone.js',
          'public/components/fastclick/lib/fastclick.js',
          'public/components/nprogress/nprogress.js',
          'public/components/socialite/socialite.js',
          'public/js/namespaces.js',
          'public/js/helpers.js',
          'public/js/main.js',
        ],
        dest: 'public/js/<%= pkg.name %>.js',
        nonull: true
      },
    },

    groundskeeper: {
      options: {
        debugger: false,
        console: false
      },
      compile: {
        files: {
          'public/js/<%= pkg.name %>.js': 'public/js/<%= pkg.name %>.js'
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        report: 'min'
      },
      build: {
        files: {
          'public/js/<%= pkg.name %>.min.js' : ['public/js/<%= pkg.name %>.js']
        }
      }
    },

    autoprefixer: {
      dist: {
        files: {
            'public/css/main.css': 'public/css/main.css'
        }
      }
    }

  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-groundskeeper');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('default', ['develop', 'concat', 'groundskeeper', 'autoprefixer', 'uglify', 'watch']);
};
