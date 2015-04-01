/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);
var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

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
        Button({bsSize: "xsmall", onClick: this.onClear},
          "Clear"
        ),
        Button({bsSize: "xsmall", onClick: this.onFind},
          "Find"
        ),
        Button({bsSize: "xsmall", onClick: this.onBookmark},
          "Bookmark"
        ),
        DropdownButton({bsSize: "xsmall", title: "Options"},
          MenuItem({key: "inlineDetails", onClick: this.onShowInlineDetails},
            "Show Inline Packet Details"
          )
        )
      )
    )
  },

  // Commands

  onClear: function(event) {
    // xxxHonza: TODO
  },

  onFind: function(event) {
    postChromeMessage("find");
  },

  onBookmark: function(event) {
    // xxxHonza: TODO
    // insert a horizontal line with summary: number of packets
    // sent/received + amount of data sent/received
  },

  onShowInlineDetails: function() {
    // xxxHonza: TODO
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
