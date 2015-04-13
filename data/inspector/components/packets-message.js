/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/reps");

// Constants
const { DIV } = Reps.DOM;

/**
 * @template xxxHonza TODO docs
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
      DIV({className: "packetsMessage"},
        DIV({className: "text"}, message),
        DIV({className: "time"}, timeText)
      )
    )
  }
});

// Exports from this module
exports.PacketsMessage = React.createFactory(PacketsMessage);
});
