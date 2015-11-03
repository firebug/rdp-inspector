/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// RDP Inspector
const { PacketDetails } = require("./packet-details");
const { PacketEditor } = require("./packet-editor");
const { PacketStackSidePanel } = require("./packet-stack-sidepanel");

// Constants
const { Tabs, Tab } = require("shared/react-bootstrap-factories");

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
    window.removeEventListener("rdpinspector:switchToPacketEditorTab", this.onSwitchToPacketEditorTab);
  },

  onSwitchToPacketEditorTab: function() {
    this.setState({ activeKey: 2 });
  },

  render: function() {
    // TODO xxxRpl: externalize and localize sidebar tab titles
    return (
      Tabs({
        className: "sideBarTabbedArea", animation: false,
        activeKey: this.state.activeKey,
        onSelect: this.onTabSelected
      },
        Tab({ eventKey: 1, title: "Packet Details" },
          PacketDetails({
            selectedPacket: this.props.selectedPacket
          })
        ),
        Tab({ eventKey: 2, title: "Send Packet" },
          PacketEditor({
            actions: this.props.actions,
            actorIDs: this.props.actorIDs,
            editedPacket: this.props.editedPacket
          })
        ),
        Tab({ eventKey: 3, title: "Stack" },
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
