/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var React = require("react");
var ReactBootstrap = require("react-bootstrap");

// Shortcuts
var ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
var Button = React.createFactory(ReactBootstrap.Button);
var DropdownButton = React.createFactory(ReactBootstrap.DropdownButton);
var MenuItem = React.createFactory(ReactBootstrap.MenuItem);

const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

/**
 * xxxHonza: TODO localization
 * xxxHonza: TODO docs
 */
var PacketsToolbar = React.createClass({
  displayName: "PacketsToolbar",

  render: function() {
    return (
      ButtonToolbar({className: "toolbar"},
        DropdownButton({bsSize: "xsmall", title: "Options"},
          MenuItem({key: "inlineDetails", onClick: this.onShowInlineDetails},
            "Show Inline Packet Details"
          ),
          MenuItem({key: "cachePackets", onClick: this.onCachePackets},
            "Cache packets before the inspector is opened"
          )
        ),
        Button({bsSize: "xsmall", onClick: this.onClear},
          "Clear"
        ),
        Button({bsSize: "xsmall", onClick: this.onFind},
          "Find"
        ),
        Button({bsSize: "xsmall", onClick: this.onBookmark},
          "Bookmark"
        )
      )
    )
  },

  // Commands

  onClear: function(event) {
    // xxxHonza: TODO
  },

  onFind: function(event) {
    postChromeMessage("find");
  },

  onBookmark: function(event) {
    // xxxHonza: TODO
    // insert a horizontal line with summary: number of packets
    // sent/received + amount of data sent/received
  },

  onShowInlineDetails: function() {
    // xxxHonza: TODO
  },

  onCachePackets: function() {
    // xxxHonza: TODO
  }
});

// Exports from this module
exports.PacketsToolbar = React.createFactory(PacketsToolbar);
});
