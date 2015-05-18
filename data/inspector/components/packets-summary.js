/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/reps");
const { TreeView } = require("reps/tree-view");
const { Obj } = require("reps/object");

// Constants
const Tooltip = React.createFactory(ReactBootstrap.Tooltip);
const OverlayTrigger = React.createFactory(ReactBootstrap.OverlayTrigger);
const { DIV } = Reps.DOM;

/**
 * @template This template is responsible for rendering packet summary
 * information. The summary can be inserted into the list by clicking
 * on 'Summary' button. It displays number of sent and received packets
 * and total amount of sent and received data.
 */
var PacketsSummary = React.createClass({
/** @lends PacketsSummary */

  displayName: "PacketsSummary",

  render: function() {
    var summary = this.props.data;
    var time = summary.time;

    var timeText = time.toLocaleTimeString() + "." + time.getMilliseconds();
    var sizeReceived = Str.formatSize(summary.data.received);
    var sizeSent = Str.formatSize(summary.data.sent);

    // Tooltips
    var sizeSentTip = Locale.$STR("rdpInspector.tooltip.sizeSent");
    var sizeReceivedTip = Locale.$STR("rdpInspector.tooltip.sizeReceived");
    var packetsSentTip = Locale.$STR("rdpInspector.tooltip.packetsSent");
    var packetsReceivedTip = Locale.$STR("rdpInspector.tooltip.packetsReceived");

    // Labels
    var packetsText = Locale.$STR("rdpInspector.label.packets");
    var dataText = Locale.$STR("rdpInspector.label.data");

    // Render summary info
    return (
      DIV({className: "packetsSummary"},
        DIV({className: "text"}, packetsText + ": "),
        TextWithTooltip({tooltip: packetsSentTip}, summary.packets.sent),
        DIV({className: "slash"}, " / "),
        TextWithTooltip({tooltip: packetsReceivedTip}, summary.packets.received),
        DIV({className: "separator"}),
        DIV({className: "text"}, dataText + ": "),
        TextWithTooltip({tooltip: sizeSentTip}, sizeSent),
        DIV({className: "slash"}, " / "),
        TextWithTooltip({tooltip: sizeReceivedTip}, sizeReceived),
        DIV({className: "separator"}),
        DIV({className: "time"}, timeText)
      )
    )
  }
});

/**
 * @template Helper template responsible for rendering a tooltip.
 */
const TextWithTooltip = React.createFactory(React.createClass({
  render: function() {
    var tooltip = Tooltip({}, this.props.tooltip);
    return (
      OverlayTrigger({placement: "top", overlay: tooltip, delayShow: 200,
        delayHide: 150},
        DIV({}, this.props.children)
      )
    );
  }
}));

// Exports from this module
exports.PacketsSummary = React.createFactory(PacketsSummary);
exports.PacketsSummaryComponent = PacketsSummary;
});
