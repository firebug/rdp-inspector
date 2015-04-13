/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/reps");

// Constants
const { DIV, SPAN } = Reps.DOM;

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
      DIV({className: "packetsLimit"},
        SPAN({className: "text"}, removedPackets + " " + label)
      )
    )
  }
});

// Exports from this module
exports.PacketsLimit = React.createFactory(PacketsLimit);
});
