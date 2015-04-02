/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");

// RDP Inspector
const { ActorsToolbar } = require("actors-toolbar");

// Shortcuts
const { TR, TD, TABLE, TBODY, THEAD, TH, DIV } = Reps.DOM;

/**
 * @template This template renders 'Actors' tab body.
 */
var ActorsPanel = React.createClass({
  displayName: "ActorsPanel",

  getInitialState: function() {
    return {
      packets: this.props.packets,
      selectedPacket: null
    };
  },

  render: function() {
    return (
      DIV({className: "actorsPanelBox"},
        ActorsToolbar(),
        DIV({}, "TODO")
      )
    );
  }
});

// Exports from this module
exports.ActorsPanel = React.createFactory(ActorsPanel);

});
