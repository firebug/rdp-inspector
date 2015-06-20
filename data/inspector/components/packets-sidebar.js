/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// RDP Inspector
const { PacketDetails } = require("./packet-details");
const { PacketEditor } = require("./packet-editor");

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

  componentWillReceiveProps: function(nextProps) {
    var { editedPacket: prevEditedPacket } = this.props;
    var { editedPacket } = nextProps;

    // switch to the Packet Editor when then editedPacket changes
    if (prevEditedPacket != editedPacket) {
      this.onTabSelected(2);
    }
  },

  render: function() {
    return (
      TabbedArea({
        className: "sideBarTabbedArea", animation: false,
        activeKey: this.state.activeKey,
        onSelect: this.onTabSelected
      },
        TabPane({eventKey: 1, tab: "Packet Details"},
          PacketDetails({selectedPacket: this.props.selectedPacket})
        ),
        TabPane({eventKey: 2, tab: "Send Packet"},
          PacketEditor({
            actions: this.props.actions,
            actorIDs: this.props.actorIDs,
            editedPacket: this.props.editedPacket
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
