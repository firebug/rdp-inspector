/* See license.txt for terms of usage */
/* eslint global-strict:0,quotes:0,no-underscore-dangle:0 */
/* eslint-env browser */
/* global require */

"use strict";

var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// filter test files
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/data/inspector/',

  // dynamically load all test files
  deps: allTestFiles,

  paths: {
    // rdp-inspector requirejs paths
    "jquery": "../lib/jquery/jquery",
    "bootstrap": "../lib/bootstrap/js/bootstrap",
    "immutable": "../lib/immutable/immutable",
    "react-bootstrap": "../lib/react-bootstrap/react-bootstrap",
    "reps": "../../node_modules/firebug.sdk/lib/reps",

    // use react-with-addons during testing
    "react": "../../karma-tests/lib/react-with-addons",

    // include jasmine custom matchers
    "karma-tests": "../../karma-tests"
  },

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
