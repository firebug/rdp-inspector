/* See license.txt for terms of usage */

define(function(require, exports /*, module */) {

"use strict";

// ReactJS
const React = require("react");

// Firebug SDK
const { TreeView } = require("reps/tree-view");

// RDP Inspector
//const { TextWithTooltip } = require("./text-with-tooltip");

// Constants
const { div, span, ul, li, a } = React.DOM;

// RDP Window injected APIs
const { Locale, Str } = require("shared/rdp-inspector-window");

/**
 * @template This template is responsible for rendering a packet.
 * Packets are rendered within {@link PacketList} sorted by time.
 *
 * A packet displays basic information in the list and can also
 * display inline preview of all inner fields.
 */
var Packet = React.createClass({
/** @lends Packet */

  displayName: "Packet",

  /**
   * Packet needs to be re-rendered only if the selection or
   * 'show inline details' option changes. This is an optimization
   * the makes the packet-list rendering a lot faster.
   */
  shouldComponentUpdate: function(nextProps, nextState) {
    var { contextMenu: prevContextMenu } = this.state || {};
    var { contextMenu: nextContextMenu } = nextState || {};

    return (this.props.selected != nextProps.selected ||
      this.props.showInlineDetails != nextProps.showInlineDetails ||
      prevContextMenu != nextContextMenu);
  },

  render: function() {
    var data = this.props.data;
    var packet = data.packet;
    var type = packet.type ? packet.type : "";
    var mode = "tiny";
    var classNames = ["packetPanel", data.type];
    var size = Str.formatSize(data.size);
    var time = data.time;
    //var stack = data.stack;

    // Use String.formatTime, but how to access from the content?
    var timeText = time.toLocaleTimeString() + "." + time.getMilliseconds();
    var previewData = {
      packet: packet
    };

    // Error packets have its own styling
    if (packet.error) {
      classNames.push("error");
    }

    // Selected packets are highlighted
    if (this.props.selected) {
      classNames.push("selected");
    }

    /*var topFrame = stack.getTopFrame();
    var stackFrameUrl = topFrame ? topFrame.getUrl() : null;
    var stackFrame = topFrame ? topFrame.getLabel() : null;*/

    // Inline preview component
    var preview = this.props.showInlineDetails ? TreeView(
      {data: previewData, mode: mode}) : null;

    if (this.props.data.type == "send") {
      return (
        div({className: classNames.join(" "), onClick: this.onClick,
             onContextMenu: this.onContextMenu},
          div({className: "packetBox"},
            div({className: "packetContent"},
              div({className: "body"},
                span({className: "text"},
                  Locale.$STR("rdpInspector.label.sent") + " "
                ),
                span({className: "type"}, type),
                span({className: "text"},
                    " " + Locale.$STR("rdpInspector.label.to") + " "
                ),
                span({className: "to"}, packet.to),
                div({},
                  /*TextWithTooltip({
                    tooltip: stackFrameUrl, className: "stackFrameLabel",
                    onClick: this.onViewSource.bind(this, topFrame)},
                    stackFrame
                  ),*/
                  span({className: "info"}, timeText + ", " + size)
                ),
                div({className: "preview"},
                  preview
                )
              ),
              div({className: "boxArrow"})
            )
          ),
          this.state && this.state.contextMenu &&
          ul({className: "dropdown-menu", role: "menu", ref: "contextMenu",
            onMouseLeave: this.onContextMenuMouseLeave,
            style: {
              display: "block",
              top: this.state.contextMenuTop,
              left: this.state.contextMenuLeft
            }},
            li({role: "presentation"},
              a({ref: "editAndResendAction", onClick: this.onEditAndResendClick},
                "Edit and Resend"))
          )
        )
      );
    } else {
      return (
        div({className: classNames.join(" "), onClick: this.onClick},
          div({className: "packetBox"},
            div({className: "packetContent"},
              div({className: "boxArrow"}),
              div({className: "body"},
                div({className: "from"},
                  span({className: "text"},
                    Locale.$STR("rdpInspector.label.received") + " "
                  ),
                  span({}, type),
                  span({className: "text"},
                    " " + Locale.$STR("rdpInspector.label.from") + " "),
                  span({}, packet.from),
                  div({},
                    /*TextWithTooltip({
                      tooltip: stackFrameUrl, className: "stackFrameLabel",
                      onClick: this.onViewSource.bind(this, topFrame)},
                      stackFrame
                    ),*/
                    span({className: "info"}, timeText + ", " + size)
                  )
                ),
                // NOTE: on issue #44, a long "consoleAPICall" received packet
                // was wrongly turned into a "div.errorMessage"
                packet.error ? div({className: "errorMessage"},
                  div({}, packet.error),
                  div({}, packet.message)
                ) : null,
                div({className: "preview"},
                  preview
                )
              )
            )
          )
        )
      );
    }
  },

  // Event Handlers
  onEditAndResendClick: function() {
    this.setState({
      contextMenu: false
    });
    this.props.actions.editPacket(this.props.data.packet);
  },

  onContextMenuMouseLeave: function() {
    this.setState({
      contextMenu: false
    });
  },

  onContextMenu: function(event) {
    event.stopPropagation();
    event.preventDefault();

    this.setState({
      contextMenu: true,
      contextMenuTop: event.clientY - 16,
      contextMenuLeft: event.clientX - 16
    });
    this.props.actions.selectPacket(this.props.data);
  },

  onClick: function(event) {
    var target = event.target;

    event.stopPropagation();
    event.preventDefault();

    // If a 'memberLabel' is clicked inside the inline preview
    // tree, let's process it by the tree, so expansion and
    // collapsing works. Otherwise just select the packet.
    if (!target.classList.contains("memberLabel")) {
      this.props.actions.selectPacket(this.props.data);
    }
  },

  onViewSource: function(topFrame, event) {
    event.stopPropagation();
    event.preventDefault();

    this.props.actions.onViewSource({
      url: topFrame.url,
      lineNumber: topFrame.lineNumber
    });
  }
});

// Exports from this module
exports.Packet = React.createFactory(Packet);
exports.PacketComponent = Packet;
});
