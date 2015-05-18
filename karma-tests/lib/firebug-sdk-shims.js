(function (window, document) {
"use strict";

// inject firebug.sdk APIs shims
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
      throw Error("UNKNOWN Option.getPref: " + key);
    }
  }
};

window.Str = {
  formatSize: function(str) { return str; }
};

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
  "css/splitter.css",
  "../../node_modules/firebug.sdk/skin/classic/shared/domTree.css"
];

stylesheets.forEach(function(url) {
  var linkEl = document.createElement("link");
  linkEl.setAttribute("href", "/base/data/inspector/" + url);
  linkEl.setAttribute("rel", "stylesheet");
  document.head.appendChild(linkEl);
})

})(window, document);
