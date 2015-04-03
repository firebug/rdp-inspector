/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/reps");

// RDP Inspector
const { ActorsPanel } = require("actors-panel");
const { PacketsPanel } = require("packets-panel");

// Constants
const TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
const TabPane = React.createFactory(ReactBootstrap.TabPane);
const { DIV } = Reps.DOM;

/**
 * @template xxxHonza: TODO: localization
 */
var MainTabbedArea = React.createClass({
  displayName: "MainTabbedArea",

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {
    return (
      TabbedArea({className: "mainTabbedArea", defaultActiveKey: 1, animation: false},
        TabPane({eventKey: 1, tab: "Packets"},
          PacketsPanel({
            packets: this.state.data,
            actions: this.props.actions,
            selectedPacket: this.state.selectedPacket
          })
        ),
        TabPane({eventKey: 2, tab: "Actors"},
          ActorsPanel()
        )
        /*TabPane({eventKey: 2, tab: "Global Actors"},
          DIV({className: "tabPane", id: "globalActorsPane"})
        ),
        TabPane({eventKey: 3, tab: "Tab Actors"},
          DIV({className: "tabPane", id: "tabActorsPane"})
        ),
        TabPane({eventKey: 4, tab: "Actor Factories"},
          DIV({className: "tabPane", id: "actorFactoriesPane"})
        )*/
      )
    )
  }
});

// Exports from this module
exports.MainTabbedArea = React.createFactory(MainTabbedArea);
});
