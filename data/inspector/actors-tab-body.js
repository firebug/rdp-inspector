/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/repository");

// RDP Inspector
const { ActorsTabToolbar } = require("actors-tab-toolbar");

// Shortcuts
const { TR, TD, TABLE, TBODY, THEAD, TH, DIV } = Reps.DOM;

/**
 * @template This template renders 'Actors' tab body.
 */
var ActorsTabBody = React.createClass({
  displayName: "ActorsTabBody",

  getInitialState: function() {
    return {
      packets: this.props.packets,
      selectedPacket: null
    };
  },

  render: function() {
    return (
      DIV({className: "actorsTabBodyBox"},
        DIV({className: "toolbar"},
          ActorsTabToolbar({}),
          DIV({}, "TODO")
        )
      )
    );
  }
});

// Exports from this module
exports.ActorsTabBody = React.createFactory(ActorsTabBody);

});
