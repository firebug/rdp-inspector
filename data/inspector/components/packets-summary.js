/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/reps");

// RDP Inspector
const { TextWithTooltip } = require("./text-with-tooltip");

// Constants
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
    );
  }
});

// Exports from this module
exports.PacketsSummary = React.createFactory(PacketsSummary);
exports.PacketsSummaryComponent = PacketsSummary;
});
