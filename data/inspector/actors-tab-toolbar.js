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

/**
 * xxxHonza: TODO localization
 * xxxHonza: TODO docs
 */
var ActorsTabToolbar = React.createClass({
  displayName: "ActorsTabToolbar",

  render: function() {
    return (
      ButtonToolbar({},
        Button({bsSize: "xsmall", onClick: this.onRefresh},
          "Refresh"
        )
      )
    )
  },

  // Commands

  onRefresh: function(event) {
    // xxxHonza: TODO
  },
});

// Exports from this module
exports.ActorsTabToolbar = React.createFactory(ActorsTabToolbar);
});
