/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");
const { TreeView } = require("reps/tree-view");

// Shortcuts
const { DIV } = Reps.DOM;

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var PacketDetails = React.createClass({
  displayName: "PacketDetails",

  getInitialState: function() {
    return {
      selectedPacket: null
    };
  },

  render: function() {
    var selectedPacket = this.props.selectedPacket || {};

    return (
      DIV({className: "details"},
        TreeView({key: "packet-detail", data: selectedPacket})
      )
    );
  }
});

// Exports from this module
exports.PacketDetails = React.createFactory(PacketDetails);
});
