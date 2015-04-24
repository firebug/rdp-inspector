/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);

const { Reps } = require("reps/reps");
const { DIV, SELECT, OPTION } = Reps.DOM;

/**
 * xxxHonza: TODO docs
 */
var ActorsToolbar = React.createClass({
/** @lends ActorsToolbar */

  displayName: "ActorsToolbar",

  render: function() {
    var { panelTypesLabels, currentPanelType } = this.props;

    var options = Object.keys(panelTypesLabels).map((value) => {
      var label = panelTypesLabels[value];
      return OPTION({ value: value }, label);
    })

    return (
      ButtonToolbar({className: "toolbar"},
        Button({bsSize: "xsmall", onClick: this.onRefresh},
          Locale.$STR("rdpInspector.cmd.refresh")
        ),
        SELECT({ selected: currentPanelType, onChange: this.onChange },
          options
        )
      )
    )
  },

  // Commands

  onRefresh: function(event) {
    this.props.actions.getActors();
  },

  onChange: function(event) {
    var type = event.target.value;
    this.props.onPanelTypeSelected(type);
  }
});

// Exports from this module
exports.ActorsToolbar = React.createFactory(ActorsToolbar);
});
