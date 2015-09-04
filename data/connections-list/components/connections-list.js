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
    let connections = this.props.connectionsList.map((conn) => {
      return ListGroupItem({
        onClick: (evt) => {
          this.props.onConnectionClick(conn, evt);
        }
      }, conn.name);
    });

    return ListGroup({}, connections);
  }
});

exports.ConnectionsList = React.createClass({
  displayName: "ConnectionsList",

  render() {
    const connections = this.props.connections || {};

    // turn the first level (connections group) into a ConnectionsGroups components
    const connectionsGroups = Object.keys(connections).map((groupName, i) => {
      return TabPane({
        key: groupName,
        tab: groupName,
        eventKey: i + 1
      }, React.createElement(ConnectionsGroup, {
        onConnectionClick: this.onConnectionClick,
        connectionsList: connections[groupName]
      }));
    });

    return TabbedArea({
      className: "mainTabbedArea",
      defaultActiveKey: 1, animation: false
    }, connectionsGroups);
  },

  onConnectionClick(conn) {
    console.log("CONNECTION CLICKED", conn);
  }
});

});
