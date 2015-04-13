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
 * @template 
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
        SPAN({className: "text"}, label + " " + removedPackets)
      )
    )
  }
});

// Exports from this module
exports.PacketsLimit = React.createFactory(PacketsLimit);
});
