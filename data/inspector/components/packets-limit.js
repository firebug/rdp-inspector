/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Constants
const { div, span } = React.DOM;

// RDP Window injected APIs
const { Locale } = require("shared/rdp-inspector-window");

/**
 * @template This template is responsible for rendering a message
 * at the top of the packet list that informs the user about reaching
 * the maximum limit of displayed packets. The message also displays
 * number of packets removed from the list.
 */
var PacketsLimit = React.createClass({
/** @lends PacketsLimit */

  displayName: "PacketsLimit",

  render: function() {
    var removedPackets = this.props.removedPackets;
    var label = Locale.$STR("rdpInspector.label.outOfLimit");

    // Render summary info
    return (
      div({className: "packetsLimit"},
        span({className: "text"}, removedPackets + " " + label)
      )
    );
  }
});

// Exports from this module
exports.PacketsLimit = React.createFactory(PacketsLimit);
});
