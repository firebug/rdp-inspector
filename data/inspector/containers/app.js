/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// React & Redux
const React = require("react");
const { connect } = require("react-redux");

// Connections List components
const MainTabbedArea = require("../components/main-tabbed-area");

const App = React.createClass({
  displayName: "App",

  render() {
    return React.createElement(MainTabbedArea, {
      view: this.props.view,
      global: this.props.global,
      actors: this.props.actors,
      packets: this.props.packets,
    });
  }
});

function mapStoreToProps(state) {
  let { global, actors, packets } = state;
  return { global, actors, packets };
}

exports.App = connect(mapStoreToProps)(App);

});
