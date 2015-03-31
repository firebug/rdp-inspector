/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);

const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

var parentNode = document.getElementById("toolbar")

/**
 * xxxHonza: TODO localization
 * xxxHonza: TODO docs
 */
var InspectorToolbar = React.createClass({
  displayName: "ButtonToolbar",
  render: function() {
    return (
      ButtonToolbar({},
        Button({bsSize: "small"}, "Refresh")
      )
    )
  }
});

var inspectorToolbar = React.createFactory(InspectorToolbar);

// Rendering
function renderToolbar() {
  React.render(inspectorToolbar(), parentNode);
}

// Exports from this module
exports.renderToolbar = renderToolbar;

});
