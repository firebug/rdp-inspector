/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// React Bootstrap factories
const {
  ListGroup, ListGroupItem,
  TabbedArea, TabPane
} = require("shared/react-bootstrap-factories");

const ConnectionsGroup = React.createClass({
  displayName: "ConnectionsGroup",

  render() {
    let connections = this.props.connections.map((conn) => {
      return ListGroupItem({
        onClick: (evt) => {
          this.props.onConnectionClick(conn, evt);
        }
      }, conn.name);
    });

    return ListGroup({ fill: true }, connections);
  }
});

exports.ConnectionList = React.createClass({
  displayName: "ConnectionList",

  render() {
    const connections = this.props.connections || {};

    // turn the first level (connections group) into a ConnectionsGroups components
    const connectionsGroups = Object.keys(connections).map((groupName, i) => {
      return TabPane({
        key: groupName,
        tab: connections[groupName].label,
        eventKey: i + 1,
        style: { overflow: "auto"}
      }, React.createElement(ConnectionsGroup, {
        onConnectionClick: this.props.onConnectionClick,
        connections: connections[groupName].connections
      }));
    });

    return TabbedArea({
      className: "mainTabbedArea",
      defaultActiveKey: 1, animation: false
    }, connectionsGroups);
  }
});

});
