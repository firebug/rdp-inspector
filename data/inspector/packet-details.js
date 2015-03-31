/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
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
    return { data: [] };
  },

  render: function() {
    // xxxHonza: FIXME
    var packet = (this.props.data && this.props.data.length) ? this.props.data[0] : {};

    return (
      DIV({className: "packetDetailsBox"},
        TreeView({data: packet})
      )
    );
  }
});

// Exports from this module
exports.PacketDetails = React.createFactory(PacketDetails);
});
