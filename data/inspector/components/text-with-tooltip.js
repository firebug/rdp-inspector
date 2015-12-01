/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// Constants
const { Tooltip, OverlayTrigger } = require("shared/react-bootstrap-factories");

const { div } = React.DOM;

/**
 * @template Helper template responsible for rendering a tooltip.
 */
const TextWithTooltip = React.createFactory(React.createClass({
  displayName: "TextWithTooltip",

  render: function() {
    var tooltip = Tooltip({}, this.props.tooltip);
    return (
      OverlayTrigger({placement: "top", overlay: tooltip, delayShow: 200,
        delayHide: 150},
        div({className: this.props.className, onClick: this.props.onClick},
          this.props.children
        )
      )
    );
  }
}));

// Exports from this module
exports.TextWithTooltip = TextWithTooltip;
});
