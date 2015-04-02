/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
var TabPane = React.createFactory(ReactBootstrap.TabPane);

// RDP Inspector
const { ActorsTabBody } = require("actors-tab-body");

const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

var content = document.getElementById("content")

var key = 1;

function handleSelect(selectedKey) {
  key = selectedKey;
  renderTabbedBox();
}

// xxxHonza: TODO: localization
var TabbedBox = React.createClass({
  displayName: "TabbedBox",
  render: function() {
    return (
      TabbedArea({className: "tabbedArea", activeKey: key,
        onSelect: handleSelect, animation: false},
        TabPane({eventKey: 1, tab: "Packets"},
          DIV({className: "tabPacketsPane tabPane", id: "tabPacketsPane"},
            "History of sent/received packets"
          )
        ),
        TabPane({eventKey: 2, tab: "Actors"},
          ActorsTabBody()
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

var tabbedBox = React.createFactory(TabbedBox);

// Rendering
function renderTabbedBox() {
  React.render(tabbedBox(), content);
}

// Exports from this module
exports.renderTabbedBox = renderTabbedBox;

});
