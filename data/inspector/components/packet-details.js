/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug SDK
const { TreeView } = require("reps/tree-view");

// Shortcuts
const { div } = React.DOM;

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var PacketDetails = React.createClass({
/** @lends PacketDetails */

  displayName: "PacketDetails",

  getInitialState: function() {
    return {
      selectedPacket: null
    };
  },

  render: function() {
    var selectedPacket = this.props.selectedPacket || {};

    return (
      div({className: "details"},
        TreeView({key: "packet-detail", data: selectedPacket.packet})
      )
    );
  }
});

// Exports from this module
exports.PacketDetails = React.createFactory(PacketDetails);
});
