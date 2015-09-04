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
    return React.createElement(ConnectionsList, {
      connections: this.props.connections,
      onConnectionClick: this.props.onConnectionClick
    });
  }
});

});
