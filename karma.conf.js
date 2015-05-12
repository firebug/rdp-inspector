// Karma configuration
// Generated on Sat May 09 2015 14:49:21 GMT+0000 (UTC)

/* eslint-env node */
/* eslint quotes:0 */

module.exports = function(config) {
  "use strict";

  var baseKarmaConfig = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'karma-tests/test-main.js',
      {pattern: 'node_modules/firebug.sdk/lib/reps/*.js', included: false },
      {pattern: 'node_modules/firebug.sdk/skin/**/*', included: false},
      {pattern: 'data/**/*.js', included: false},
      {pattern: 'data/**/*.css', included: false},
      {pattern: 'data/**/*.woff', included: false},
      {pattern: 'data/**/*.woff2', included: false},
      {pattern: 'data/**/*.ttf', included: false},
      {pattern: 'karma-tests/**/*.js', included: false},
      {pattern: 'karma-tests/**/*Spec.js', included: false}
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox']
  };

  config.set(baseKarmaConfig);

  // optionally enable code coverage
  if (process.env.CODE_COVERAGE) {
    console.log("CODE COVERAGE ENABLED");
    config.set({
      coverageReporter: {
        type: 'html',
        dir: 'coverage/',
        instrumenters: {
          istanbul: require("istanbul-harmony")
        }
      },
      preprocessors: {
        'data/inspector/**/*.js': ['coverage']
      },
      reporters: baseKarmaConfig.reporters.concat('coverage')
    });
  }
};
