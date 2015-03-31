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
        Button({bsSize: "xsmall", bsStyle: "info", onClick: this.onRefresh},
          "Refresh"
        )
      )
    )
  },

  // Commands

  /**
   * This is for debugging purposes. Clicking the 'Refresh' button
   * reloads the content and applies new changes without browser
   * restart.
   */
  onRefresh: function(event) {
    document.location.reload();
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
