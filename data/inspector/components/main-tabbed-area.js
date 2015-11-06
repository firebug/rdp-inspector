/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// ReactJS
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// RDP Inspector
const { ActorsPanel } = require("./actors-panel");
const { PacketsPanel } = require("./packets-panel");
const { SearchBox } = require("./search-box");

// Constants
const TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
const TabPane = React.createFactory(ReactBootstrap.TabPane);
const Alert = React.createFactory(ReactBootstrap.Alert);

// RDP Window injected APIs
const { Locale } = require("shared/rdp-inspector-window");

/**
 * @template This template is responsible for rendering the main
 * application UI. The UI consist from set of tabs (Packets and Actors)
 * displaying list of sent/received packets and list of registered
 * actors.
 */
var MainTabbedArea = React.createClass({
/** @lends MainTabbedArea */

  displayName: "MainTabbedArea",

  getInitialState: function() {
    return { packets: [] };
  },

  componentDidMount: function() {
    var tabbedArea = this.refs.tabbedArea.getDOMNode();
    SearchBox.create(tabbedArea.querySelector(".nav-tabs"));
  },

  componentWillUnmount: function() {
    var tabbedArea = this.refs.tabbedArea.getDOMNode();
    SearchBox.destroy(tabbedArea.querySelector(".nav-tabs"));
  },

  onErrorDismiss: function() {
    this.props.view.clearError();
  },

  render: function() {
    var packets = Locale.$STR("rdpInspector.tab.Packets");
    var actors = Locale.$STR("rdpInspector.tab.Actors");
    var { error } = this.props.packets;

    return (
      TabbedArea({className: "mainTabbedArea", defaultActiveKey: 1,
        animation: false, ref: "tabbedArea"},
        error ? Alert({
          bsStyle: "warning",
          onDismiss: this.onErrorDismiss,
          dismissAfter: 2000,
          style: {
            position: "absolute",
            width: "100%",
            zIndex: 999999
          }
        }, error.message) : null,
        TabPane({eventKey: 1, tab: packets},
          PacketsPanel({
            packets: this.props.packets.filteredPackets,
            actions: this.props.view,
            selectedPacket: this.props.packets.selectedPacket,
            editedPacket: this.props.packets.editedPacket,
            searchFilter: this.props.packets.filter,
            showInlineDetails: this.props.packets.options.showInlineDetails,
            packetCacheEnabled: this.props.packets.options.packetCacheEnabled,
            removedPackets: this.props.packets.removedPackets,
            paused: this.props.packets.paused,
            actorIDs: this.props.actors.actorIDs
          })
        ),
        TabPane({eventKey: 2, tab: actors},
          ActorsPanel({
            actions: this.props.view,
            actors: this.props.actors,
            searchFilter: this.props.packets.filter
          })
        )
      )
    );
  }
});

// Exports from this module
module.exports = MainTabbedArea;
});
