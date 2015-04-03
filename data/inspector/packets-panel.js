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
          PacketsToolbar({
            actions: this.props.actions,
            showInlineDetails: this.props.showInlineDetails
          }),
          PacketList({
            data: this.props.packets,
            actions: this.props.actions,
            selectedPacket: this.props.selectedPacket,
            searchFilter: this.props.searchFilter,
            showInlineDetails: this.props.showInlineDetails
          })
        ),
        DIV({className: "sidePanel"},
          PacketsSidebar({
            selectedPacket: this.props.selectedPacket
          })
        ),
        DIV({className: "panelFooter"})
      )
    )
  }
});

// Exports from this module
exports.PacketsPanel = React.createFactory(PacketsPanel);

});
