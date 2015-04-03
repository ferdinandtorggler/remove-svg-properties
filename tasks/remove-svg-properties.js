'use strict';

var removeProps = require('../index');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('remove-svg-properties', 'Remove attributes and styles from SVGs', function () {

    var done = this.async();

    var options = this.options();
    options.src = this.data.src;
    options.out = this.data.dest,

    removeProps.remove(options, done);

  });

};