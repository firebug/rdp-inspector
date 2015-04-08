/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/reps");

// RDP Inspector
const { PacketDetails } = require("./packet-details");
const { PacketEditor } = require("./packet-editor");

// Constants
const { DIV } = Reps.DOM;
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
    }
  },

  onTabSelected: function(key) {
    this.setState({
      activeKey: key
    })
  },

  componentWillReceiveProps: function(nextProps) {
    // reset activeKey to the "Packet" Detail sidebar
    // when the parent component pass a new selectedPacket
    if (nextProps.selected && (nextProps.selectedPacket !== this.selectedPacket)) {
      this.setState({
        activeKey: 1
      });
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
            actions: this.props.actions
          })
        )
      )
    );
  }
});

// Exports from this module
exports.PacketsSidebar = React.createFactory(PacketsSidebar);
});
