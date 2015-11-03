/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
var React = require("react");

// Shortcuts
const { ButtonToolbar, Button } = require("shared/react-bootstrap-factories");

const { select, option } = React.DOM;

// RDP Window injected APIs
const { Locale } = require("shared/rdp-inspector-window");

/**
 * @template This object is responsible for rendering the toolbar
 * in Actors tab
 */
var ActorsToolbar = React.createClass({
/** @lends ActorsToolbar */

  displayName: "ActorsToolbar",

  render: function() {
    var { panelTypesLabels, currentPanelType } = this.props;

    var options = Object.keys(panelTypesLabels).map((value) => {
      var label = panelTypesLabels[value];
      return option({ value: value, key: value }, label);
    });

    return (
      ButtonToolbar({className: "toolbar"},
        Button({bsSize: "xsmall", onClick: this.onRefresh},
          Locale.$STR("rdpInspector.cmd.refresh")
        ),
        select({ selected: currentPanelType, onChange: this.onChange },
          options
        )
      )
    );
  },

  // Commands

  onRefresh: function(/*event*/) {
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
