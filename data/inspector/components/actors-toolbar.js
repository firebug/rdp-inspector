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
 * xxxHonza: TODO docs
 */
var ActorsToolbar = React.createClass({
/** @lends ActorsToolbar */

  displayName: "ActorsToolbar",

  render: function() {
    return (
      ButtonToolbar({className: "toolbar"},
        Button({bsSize: "xsmall", onClick: this.onRefresh},
          Locale.$STR("rdpInspector.cmd.refresh")
        )
      )
    )
  },

  // Commands

  onRefresh: function(event) {
    this.props.actions.getActors();
  },
});

// Exports from this module
exports.ActorsToolbar = React.createFactory(ActorsToolbar);
});
