/* See license.txt for terms of usage */

(function (window, document) {

"use strict";

// set the theme-firebug class on the body element
document.body.setAttribute("class", "theme-firebug");

// bootstrap, firebug.sdk and rdp-inspector stylesheets
var stylesheets = [
  "../lib/bootstrap/css/bootstrap.css",
  "css/base.css",
  "css/toolbox.css",
  "css/toolbar.css",
  "css/packets-panel.css",
  "css/actors-panel.css",
  "css/search-box.css",
  "css/tree-editor-view.css",
  "../../node_modules/firebug.sdk/skin/classic/shared/domTree.css",
  "../../node_modules/firebug.sdk/skin/classic/shared/splitter.css"
];

stylesheets.forEach(function(url) {
  var linkEl = document.createElement("link");
  linkEl.setAttribute("href", "/base/data/inspector/" + url);
  linkEl.setAttribute("rel", "stylesheet");
  document.head.appendChild(linkEl);
})

})(window, document);
