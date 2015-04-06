/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Constants
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);
var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

/**
 * @template This object represents a template for a toolbar displayed
 * within the Packets tab
 */
var PacketsToolbar = React.createClass({
  displayName: "PacketsToolbar",

  render: function() {
    var showInlineDetails = this.props.showInlineDetails;

    return (
      ButtonToolbar({className: "toolbar"},
        DropdownButton({bsSize: "xsmall", title: "Options"},
          MenuItem({key: "inlineDetails", onClick: this.onShowInlineDetails,
            checked: showInlineDetails},
            Locale.$STR("rdpInspector.option.inlineDetails")
          )/*,
          MenuItem({key: "cachePackets", onClick: this.onCachePackets},
            Locale.$STR("rdpInspector.option.cachePackets")
          )*/
        ),
        Button({bsSize: "xsmall", onClick: this.onClear},
          Locale.$STR("rdpInspector.cmd.clear")
        ),
        Button({bsSize: "xsmall", onClick: this.onFind},
          Locale.$STR("rdpInspector.cmd.find")
        ),
        Button({bsSize: "xsmall", onClick: this.onSummary},
          Locale.$STR("rdpInspector.cmd.summary")
        )
      )
    )
  },

  // Commands

  onClear: function(event) {
    this.props.actions.clear();
  },

  onFind: function(event) {
    this.props.actions.find();
  },

  onSummary: function(event) {
    this.props.actions.appendSummary();
  },

  onShowInlineDetails: function() {
    this.props.actions.onShowInlineDetails();
  },

  onCachePackets: function() {
    // xxxHonza: TODO
  }
});

// Exports from this module
exports.PacketsToolbar = React.createFactory(PacketsToolbar);
});
