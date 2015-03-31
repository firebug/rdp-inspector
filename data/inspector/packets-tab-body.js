/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const { PacketList } = require("./packet-list");
const { PacketDetails } = require("./packet-details");
const { Reps } = require("reps/repository");

// Shortcuts
const { TR, TD, TABLE, TBODY, THEAD, TH, DIV } = Reps.DOM;

/**
 * @template This template renders 'Packets' tab body.
 */
var PacketsTabBody = React.createClass({
  displayName: "PacketsTabBody",

  getInitialState: function() {
    return { data: this.props.data };
  },

  render: function() {
    return (
      TABLE({className: "packetsTabBodyBox"},
        TBODY({},
          TR({},
            TD({className: "list"},
              PacketList({data: this.state.data})
            ),
            TD({className: "details"},
              PacketDetails({data: this.state.data})
            )
          )
        )
      )
    );
  }
});

// Exports from this module
exports.PacketsTabBody = React.createFactory(PacketsTabBody);

});
