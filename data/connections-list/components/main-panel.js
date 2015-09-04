/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Connections List components
const { ConnectionsList } = require("./connections-list");

exports.MainPanel = React.createClass({
  displayName: "MainPanel",

  render() {
    let connections = {
      "Local Tabs": [
        { name: "New Tab", status: "CONNECTED" },
        { name: "Tab2", status: "CONNECTED" },
      ],
      "WebIDE": [
        { name: "Remote", status: "CONNECTED" }
      ]
    };

    return React.createElement(ConnectionsList, {
      connections
    });
  }
});

});
