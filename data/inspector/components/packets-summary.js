/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// RDP Inspector
const { TextWithTooltip } = require("./text-with-tooltip");

// RDP Window injected APIs
const { Locale, Str } = require("shared/rdp-inspector-window");


// Constants
const { div } = React.DOM;

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
      div({className: "packetsSummary"},
        div({className: "text"}, packetsText + ": "),
        TextWithTooltip({tooltip: packetsSentTip}, summary.packets.sent),
        div({className: "slash"}, " / "),
        TextWithTooltip({tooltip: packetsReceivedTip}, summary.packets.received),
        div({className: "separator"}),
        div({className: "text"}, dataText + ": "),
        TextWithTooltip({tooltip: sizeSentTip}, sizeSent),
        div({className: "slash"}, " / "),
        TextWithTooltip({tooltip: sizeReceivedTip}, sizeReceived),
        div({className: "separator"}),
        div({className: "time"}, timeText)
      )
    );
  }
});

// Exports from this module
exports.PacketsSummary = React.createFactory(PacketsSummary);
exports.PacketsSummaryComponent = PacketsSummary;
});
