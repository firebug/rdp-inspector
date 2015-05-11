/* eslint global-strict:0,quotes:0,no-underscore-dangle:0 */
/* eslint-env browser */
/* global require */

"use strict";

var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path; //.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

window.Locale = {
  $STR: function(s) { return s; }
};

window.Options = {
  getPref: function(key) {
    /* eslint no-console: 0 */
    switch(key) {
    case "extensions.rdpinspector.packetLimit":
      return 100;
    default:
      console.log("UNKOWN Option.getPref: ", key);
      return null;
    }
  }
};

window.Str = {
  formatSize: function(str) { return str; }
};

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/data/inspector/',

  // dynamically load all test files
  deps: allTestFiles,

  paths: {
    "jquery": "../lib/jquery/jquery",
    "react": "../../karma-tests/lib/react-with-addons",
    "bootstrap": "../lib/bootstrap/js/bootstrap",
    "immutable": "../lib/immutable/immutable",
    "react-bootstrap": "../lib/react-bootstrap/react-bootstrap",
    "reps": "../../node_modules/firebug.sdk/lib/reps",

    "squire": "../../karma-tests/lib/squire",
    "test-mocks": "../../karma-tests/mocks"
  },

  map: {
    "components/main-tabbed-area": {
      "./components/search-box": "test-mocks/components/search-box"
    }
  },

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

document.body.setAttribute("class", "theme-firebug");

[
  "../lib/bootstrap/css/bootstrap.css",
  "css/base.css",
  "css/toolbox.css",
  "css/toolbar.css",
  "css/packets-panel.css",
  "css/actors-panel.css",
  "css/search-box.css",
  "css/tree-editor-view.css",
  "css/splitter.css",
  "../../node_modules/firebug.sdk/skin/classic/shared/domTree.css"
].forEach(function(url) {
  var linkEl = document.createElement("link");
  linkEl.setAttribute("href", "/base/data/inspector/" + url);
  linkEl.setAttribute("rel", "stylesheet");
  document.head.appendChild(linkEl);
})
