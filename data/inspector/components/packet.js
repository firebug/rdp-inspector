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
const Panel = React.createFactory(ReactBootstrap.Panel);
const { DIV, SPAN, BR, IMG } = Reps.DOM;

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
    return (this.props.selected != nextProps.selected ||
      this.props.showInlineDetails != nextProps.showInlineDetails);
  },

  render: function() {
    var packet = this.props.data.packet;
    var type = packet.type ? packet.type : "";
    var mode = "tiny";
    var classNames = ["packetPanel", this.props.data.type];
    var size = Str.formatSize(this.props.data.size);
    var time = this.props.data.time;

    // Use String.formatTime, but how to access from the content?
    var timeText = time.toLocaleTimeString() + "." + time.getMilliseconds();
    var previewData = {
      packet: packet
    }

    // Error packets have its own styling
    if (packet.error) {
      classNames.push("error");
    }

    // Selected packets are highlighted
    if (this.props.selected) {
      classNames.push("selected");
    }

    // Inline preview component
    var preview = this.props.showInlineDetails ? TreeView(
      {data: previewData, mode: mode}) : null;

    if (this.props.data.type == "send") {
      return (
        DIV({className: classNames.join(" "), onClick: this.onClick},
          DIV({className: "packetBox"},
            DIV({className: "packetContent"},
              DIV({className: "body"},
                SPAN({className: "text"},
                  Locale.$STR("rdpInspector.label.sent") + " "
                ),
                SPAN({className: "type"}, type),
                SPAN({className: "text"},
                    " " + Locale.$STR("rdpInspector.label.to") + " "
                ),
                SPAN({className: "to"}, packet.to),
                SPAN({className: "info"}, timeText + ", " + size),
                DIV({className: "preview"},
                  preview
                )
              ),
              DIV({className: "boxArrow"})
            )
          )
        )
      );
    } else {
      return (
        DIV({className: classNames.join(" "), onClick: this.onClick},
          DIV({className: "packetBox"},
            DIV({className: "packetContent"},
              DIV({className: "boxArrow"}),
              DIV({className: "body"},
                DIV({className: "from"},
                  SPAN({className: "text"},
                    Locale.$STR("rdpInspector.label.received") + " "
                  ),
                  SPAN({}, type),
                  SPAN({className: "text"},
                    " " + Locale.$STR("rdpInspector.label.from") + " "),
                  SPAN({}, packet.from),
                  SPAN({className: "info"}, timeText + ", " + size)
                ),
                DIV({className: "errorMessage"},
                  DIV({}, packet.error),
                  DIV({}, packet.message)
                ),
                DIV({className: "preview"},
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

  onClick: function(event) {
    var target = event.target;

    event.stopPropagation();
    event.preventDefault();

    // If a 'memberLabel' is clicked inside the inline preview
    // tree, let's process it by the tree, so expansion and
    // collapsing works. Otherwise just select the packet.
    if (!target.classList.contains("memberLabel")) {
      this.props.actions.selectPacket(this.props.data.packet);
    }
  }
});

// Exports from this module
exports.Packet = React.createFactory(Packet);
exports.PacketComponent = Packet;
});
