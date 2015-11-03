/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Constants
const { div } = React.DOM;

/**
 * @template This template renders a generic message within the
 * packet list.
 */
var PacketsMessage = React.createClass({
/** @lends PacketsMessage */

  displayName: "PacketsMessage",

  render: function() {
    var packet = this.props.data;
    var message = packet.message;
    var time = packet.time;

    var timeText = time.toLocaleTimeString() + "." + time.getMilliseconds();

    // Render summary info
    return (
      div({className: "packetsMessage"},
        div({className: "text"}, message),
        div({className: "time"}, timeText)
      )
    );
  }
});

// Exports from this module
exports.PacketsMessage = React.createFactory(PacketsMessage);
});
