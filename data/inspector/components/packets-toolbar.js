/* See license.txt for terms of usage */
/* globals Locale */

define(function(require, exports, module) {
"use strict";

// ReactJS
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Constants
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);
var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

const { Reps } = require("reps/reps");
const { SPAN } = Reps.DOM;

/**
 * @template This object represents a template for a toolbar displayed
 * within the Packets tab
 */
var PacketsToolbar = React.createClass({
/** @lends PacketsToolbar */

  displayName: "PacketsToolbar",

  render: function() {
    var showInlineDetails = this.props.showInlineDetails;
    var label = showInlineDetails ?
      Locale.$STR("rdpInspector.option.hideInlineDetails") :
      Locale.$STR("rdpInspector.option.showInlineDetails");

    var paused = this.props.paused;
    var pauseClassName = paused ? "btn-warning" : "";

    return (
      ButtonToolbar({className: "toolbar"},
        DropdownButton({bsSize: "xsmall", title: "File"},
          MenuItem({key: "fileLoad", onClick: this.onLoadPacketsFromFile }, "Load"),
          MenuItem({key: "fileSave", onClick: this.onSavePacketsFromFile }, "Save")
        ),
        DropdownButton({
          bsSize: "xsmall", title: "Options",
          className: "pull-right", ref: "options"
        },
          MenuItem({key: "inlineDetails", onClick: this.onShowInlineDetails,
            checked: showInlineDetails},
            label
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
        ),
        Button({bsSize: "xsmall", className: pauseClassName,
          onClick: this.onPause},
          SPAN({className: "glyphicon glyphicon-pause", "aria-hidden": true})
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
    this.refs.options.setDropdownState(false);
  },

  onCachePackets: function() {
    // xxxHonza: TODO
  },

  onPause: function(event) {
    this.props.actions.onPause();
  },

  onLoadPacketsFromFile: function(event) {
    this.props.actions.loadPacketsFromFile();
  },

  onSavePacketsFromFile: function(event) {
    this.props.actions.savePacketsToFile();
  }
});

// Exports from this module
exports.PacketsToolbar = React.createFactory(PacketsToolbar);
exports.PacketsToolbarComponent = PacketsToolbar;
});
