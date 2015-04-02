/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");

// RDP Inspector
const { PacketList } = require("packet-list");
const { PacketsSidebar } = require("packets-sidebar");
const { PacketsToolbar } = require("packets-toolbar");

// Shortcuts
const { TR, TD, TABLE, TBODY, THEAD, TH, DIV } = Reps.DOM;

/**
 * @template This template renders 'Packets' tab body.
 */
var PacketsPanel = React.createClass({
  displayName: "PacketsPanel",

  getInitialState: function() {
    return {
      packets: this.props.packets,
      selectedPacket: null
    };
  },

  render: function() {
    return (
      DIV({className: "packetsPanelBox"},
        DIV({className: "mainPanel"},
          PacketsToolbar(),
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
exports.PacketsPanel = React.createFactory(PacketsPanel);

});
