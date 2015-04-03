/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/reps");

// RDP Inspector
const { Packet } = require("packet");
const { PacketsSummary } = require("packets-summary");

// Constants
const { DIV } = Reps.DOM;

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var PacketList = React.createClass({
  displayName: "PacketList",

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {
    var output = [];
    var filter = this.props.searchFilter;

    var packets = this.props.data;
    for (var i in packets) {
      var packet = packets[i];
      packets[i].key = i;

      // Special treatment for 'summary' packets.
      if (packet.type == "summary") {
        output.push(PacketsSummary({
          data: packet
        }));
        continue;
      }

      // Filter out packets which don't match the search token.
      if (filter && JSON.stringify(packet).indexOf(filter) < 0) {
        continue;
      }

      var selected = this.props.selectedPacket == packet.packet;

      output.push(Packet({
        data: packet,
        actions: this.props.actions,
        selected: selected,
        showInlineDetails: this.props.showInlineDetails
      }));
    };

    return (
      DIV({className: "list"},
        DIV({}, output)
      )
    );
  }
});

// Exports from this module
exports.PacketList = React.createFactory(PacketList);
});
