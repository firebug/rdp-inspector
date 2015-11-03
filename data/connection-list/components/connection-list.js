/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// React Bootstrap factories
const {
  ListGroup, ListGroupItem,
  Tabs, Tab
} = require("shared/react-bootstrap-factories");

const ConnectionsGroup = React.createClass({
  displayName: "ConnectionsGroup",

  render() {
    let connections = this.props.connections.map((conn) => {
      return ListGroupItem({
        style: { width: "100%" },
        onClick: (evt) => {
          this.props.onConnectionClick(conn, evt);
        }
      }, conn.name);
    });

    return ListGroup({ style: { width: "100%" } }, connections);
  }
});

exports.ConnectionList = React.createClass({
  displayName: "ConnectionList",

  render() {
    const connections = this.props.connections || {};

    // turn the first level (connections group) into a ConnectionsGroups components
    const connectionsGroups = Object.keys(connections).map((groupName, i) => {
      return Tab({
        key: groupName,
        title: connections[groupName].label,
        eventKey: i + 1,
        style: { overflow: "auto" }
      }, React.createElement(ConnectionsGroup, {
        onConnectionClick: this.props.onConnectionClick,
        connections: connections[groupName].connections
      }));
    });

    return Tabs({
      className: "mainTabbedArea",
      defaultActiveKey: 1, animation: false
    }, connectionsGroups);
  }
});

});
