/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// Firebug SDK
const { createFactories } = require("reps/rep-utils");
const { Splitter } = createFactories(require("reps/splitter"));

// RDP Inspector
const { PacketList } = require("./packet-list");
const { PacketsSidebar } = require("./packets-sidebar");
const { PacketsToolbar } = require("./packets-toolbar");

// Shortcuts
const { div } = React.DOM;

/**
 * @template This template renders 'Packets' tab body.
 */
var PacketsPanel = React.createClass({
/** @lends PacketPanel */

  displayName: "PacketsPanel",

  getInitialState: function() {
    return {
      packets: this.props.packets,
      selectedPacket: null
    };
  },

  render: function() {
    var leftPanel = div({className: "mainPanel"},
      PacketsToolbar({
        actions: this.props.actions,
        showInlineDetails: this.props.showInlineDetails,
        packetCacheEnabled: this.props.packetCacheEnabled,
        paused: this.props.paused
      }),
      PacketList({
        data: this.props.packets,
        actions: this.props.actions,
        selectedPacket: this.props.selectedPacket,
        searchFilter: this.props.searchFilter,
        showInlineDetails: this.props.showInlineDetails,
        removedPackets: this.props.removedPackets
      })
    );

    var rightPanel = div({className: "sidePanel"},
      PacketsSidebar({
        selectedPacket: this.props.selectedPacket,
        editedPacket: this.props.editedPacket,
        actions: this.props.actions,
        actorIDs: this.props.actorIDs
      })
    );

    return (
      div({className: "packetsPanelBox"},
        Splitter({
          mode: "vertical",
          min: 200,
          leftPanel: leftPanel,
          rightPanel: rightPanel,
          innerBox: div({className: "innerBox"})
        })
      )
    );
  }
});

// Exports from this module
exports.PacketsPanel = React.createFactory(PacketsPanel);
exports.PacketsPanelComponent = PacketsPanel;

});
