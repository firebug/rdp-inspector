/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/reps");

// RDP Inspector
const { Packet } = require("./packet");
const { PacketsSummary } = require("./packets-summary");
const { PacketsLimit } = require("./packets-limit");
const { PacketsMessage } = require("./packets-message");

// Shortcuts
const { DIV } = Reps.DOM;

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var PacketList = React.createClass({
/** @lends PacketList */

  displayName: "PacketList",

  getInitialState: function() {
    return { data: [] };
  },

  componentWillUpdate: function() {
    var node = this.getDOMNode();
    this.shouldScrollBottom = node.scrollTop +
      node.offsetHeight === node.scrollHeight;
  },

  componentDidUpdate: function() {
    if (this.shouldScrollBottom) {
      var node = this.getDOMNode();
      node.scrollTop = node.scrollHeight;
    }
  },

  render: function() {
    var output = [];
    var filter = this.props.searchFilter;
    var removedPackets = this.props.removedPackets;

    if (removedPackets > 0) {
      output.push(PacketsLimit({
        removedPackets: removedPackets
      }));
    }

    var packets = this.props.data;
    for (var i in packets) {
      var packet = packets[i];

      // Render 'summary' packets.
      if (packet.type == "summary") {
        output.push(PacketsSummary({
          key: packet.id,
          data: packet
        }));
        continue;
      }

      // Render 'message' packets.
      if (packet.type == "message") {
        output.push(PacketsMessage({
          key: packet.id,
          data: packet
        }));
        continue;
      }

      // Filter out packets which don't match the search token.
      if (filter && packet.rawPacket.toLowerCase().indexOf(filter.toLowerCase()) < 0) {
        continue;
      }

      var selected = this.props.selectedPacket == packet;

      output.push(Packet({
        key: packet.id,
        data: packet,
        actions: this.props.actions,
        selected: selected,
        showInlineDetails: this.props.showInlineDetails
      }));
    }

    return (
      DIV({className: "list"},
        DIV({}, output)
      )
    );
  }
});

// Exports from this module
exports.PacketList = React.createFactory(PacketList);
exports.PacketListComponent = PacketList;
});
