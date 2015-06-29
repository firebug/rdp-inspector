/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// RDP Inspector
const { PacketDetails } = require("./packet-details");
const { PacketEditor } = require("./packet-editor");
const { PacketStackSidePanel } = require("./packet-stack-sidepanel");

// Constants
const TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
const TabPane = React.createFactory(ReactBootstrap.TabPane);

/**
 * @template This template represents a list of packets displayed
 * inside the panel content.
 */
var PacketsSidebar = React.createClass({
/** @lends PacketsSidebar */

  displayName: "PacketsSidebar",

  getInitialState: function() {
    return {
      activeKey: 1
    };
  },

  onTabSelected: function(key) {
    this.setState({
      activeKey: key
    });
  },

  componentDidMount: function() {
    window.addEventListener("rdpinspector:switchToPacketEditorTab",
      this.onSwitchToPacketEditorTab);
  },

  componentWillUnmount: function() {
    window.removeEventListener(this.onSwitchToPacketEditorTab);
  },

  onSwitchToPacketEditorTab: function() {
    this.setState({ activeKey: 2 });
  },

  render: function() {
    return (
      TabbedArea({
        className: "sideBarTabbedArea", animation: false,
        activeKey: this.state.activeKey,
        onSelect: this.onTabSelected
      },
        TabPane({eventKey: 1, tab: "Packet Details"},
          PacketDetails({
            selectedPacket: this.props.selectedPacket
          })
        ),
        TabPane({eventKey: 2, tab: "Send Packet"},
          PacketEditor({
            actions: this.props.actions,
            actorIDs: this.props.actorIDs,
            editedPacket: this.props.editedPacket
          })
        ),
        TabPane({eventKey: 3, tab: "Stack"},
          PacketStackSidePanel({
            actions: this.props.actions,
            selectedPacket: this.props.selectedPacket
          })
        )
      )
    );
  }
});

// Exports from this module
exports.PacketsSidebar = React.createFactory(PacketsSidebar);
exports.PacketsSidebarComponent = PacketsSidebar;
});
