/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React & Redux
const React = require("react");
const { connect } = require("react-redux");

// Connections List components
const { ConnectionList } = require("../components/connection-list");

const MainPanel = React.createClass({
  displayName: "MainPanel",

  render() {
    return React.createElement(ConnectionList, {
      connections: this.props.connections,
      onConnectionClick: this.props.onConnectionClick
    });
  }
});

function mapStoreToProps(state) {
  let { connections } = state;
  return { connections };
}

exports.MainPanel = connect(mapStoreToProps)(MainPanel);

});
