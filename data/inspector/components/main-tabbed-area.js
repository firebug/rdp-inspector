/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// ReactJS
var React = require("react");
var ReactDOM = require("react-dom");

// RDP Inspector
const { ActorsPanel } = require("./actors-panel");
const { PacketsPanel } = require("./packets-panel");
const { SearchBox } = require("./search-box");

// Constants
const { Tabs, Tab, Alert } = require("shared/react-bootstrap-factories");

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
    var tabbedArea = ReactDOM.findDOMNode(this.refs.tabbedArea);
    SearchBox.create(tabbedArea.querySelector(".nav-tabs"));
  },

  componentWillUnmount: function() {
    var tabbedArea = ReactDOM.findDOMNode(this.refs.tabbedArea);
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
      Tabs({className: "mainTabbedArea", defaultActiveKey: 1,
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
        Tab({ eventKey: 1, title: packets },
          PacketsPanel({
            packets: this.props.packets.filteredPackets,
            actions: this.props.view,
            selectedPacket: this.props.packets.selectedPacket,
            editedPacket: this.props.packets.editedPacket,
            searchFilter: this.props.global.searchFilter,
            showInlineDetails: this.props.packets.options.showInlineDetails,
            packetCacheEnabled: this.props.packets.options.packetCacheEnabled,
            removedPackets: this.props.packets.removedPackets,
            paused: this.props.packets.paused,
            actorIDs: this.props.actors.actorIDs
          })
        ),
        Tab({ eventKey: 2, title: actors },
          ActorsPanel({
            actions: this.props.view,
            actors: this.props.actors,
            searchFilter: this.props.global.searchFilter
          })
        )
      )
    );
  }
});

// Exports from this module
module.exports = MainTabbedArea;
});
