/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");
const { TreeView } = require("reps/tree-view");

// Shortcuts
const { DIV } = Reps.DOM;

/**
 * @template This template represents a side panel that displays
 * list of stack-frames for selected packet.
 */
var PacketStackSidePanel = React.createClass({
/** @lends PacketStackSidePanel */

  displayName: "PacketStackSidePanel",

  getInitialState: function() {
    return {
      selectedPacket: null
    };
  },

  render: function() {
    var selectedPacket = this.props.selectedPacket || {};
    var frames = selectedPacket.stack ? selectedPacket.stack.frames : [];

    function getObjectProperties(obj, callback) {
      for (var p in obj) {
        try {
          if (typeof obj[p] != "function") {
            callback(p, obj[p]);
          }
        }
        catch (e) {
        }
      }
    }

    return (
      DIV({className: "stackSidePanel"},
        TreeView({key: "packet-detail", data: frames,
          getObjectProperties: getObjectProperties})
      )
    );
  }
});

// Exports from this module
exports.PacketStackSidePanel = React.createFactory(PacketStackSidePanel);
});
