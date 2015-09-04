/* See license.txt for terms of usage */

define(function(require/*, exports, module*/) {

"use strict";

require("shared/rdp-inspector-window");

const { MainPanel } = require("./components/main-panel");

// ReactJS
var React = require("react");

React.render(
  React.createElement(MainPanel, {}),
  document.querySelector("#content")
);

});
