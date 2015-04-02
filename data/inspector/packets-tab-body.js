/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");

// RDP Inspector
const { PacketList } = require("packet-list");
const { PacketsSidebar } = require("packets-sidebar");
const { PacketsTabToolbar } = require("packets-tab-toolbar");

// Shortcuts
const { TR, TD, TABLE, TBODY, THEAD, TH, DIV } = Reps.DOM;

/**
 * @template This template renders 'Packets' tab body.
 */
var PacketsTabBody = React.createClass({
  displayName: "PacketsTabBody",

  getInitialState: function() {
    return {
      packets: this.props.packets,
      selectedPacket: null
    };
  },

  render: function() {
    return (
      DIV({className: "packetsTabBodyBox"},
        DIV({className: "mainPanel"},
          PacketsTabToolbar(),
          PacketList({
            data: this.state.packets,
            actions: this.props.actions
          })
        ),
        DIV({className: "sidePanel"},
          PacketsSidebar({selectedPacket: this.state.selectedPacket})
        ),
        DIV({className: "panelFooter"})
      )
    )
  }
});

// Exports from this module
exports.PacketsTabBody = React.createFactory(PacketsTabBody);

});
