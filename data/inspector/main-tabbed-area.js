/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// RDP Inspector
const { ActorsPanel } = require("actors-panel");
const { PacketsPanel } = require("packets-panel");

const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

// Constants
var TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
var TabPane = React.createFactory(ReactBootstrap.TabPane);

var content = document.getElementById("content")

var key = 1;

function handleSelect(selectedKey) {
  key = selectedKey;
  renderTabbedBox();
}

// xxxHonza: TODO: localization
var MainTabbedArea = React.createClass({
  displayName: "MainTabbedArea",

  getInitialState: function() {
    return { data: [] };
  },

  render: function() {
    return (
      TabbedArea({className: "mainTabbedArea", activeKey: key,
        onSelect: handleSelect, animation: false},
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

var tabbedBox = React.createFactory(MainTabbedArea);

// Rendering
function renderTabbedBox() {
  React.render(tabbedBox(), content);
}

// Exports from this module
exports.renderTabbedBox = renderTabbedBox;
exports.MainTabbedArea = React.createFactory(MainTabbedArea);

});
