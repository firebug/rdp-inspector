/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// ReactJS
const React = require("react");

// RDP Inspector
const { Tracker } = require("../tracker");

// Constants
const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

/**
 * @template This template represents a simple splitter that
 * is used to divide the side panel with packet details.
 * It now supports 'vertical' mode only and 'horizontal' mode
 * should be appended as needed
 */
var Splitter = React.createClass({
/** @lends Splitter */

  displayName: "Splitter",

  componentDidMount: function() {
    var splitter = this.refs.splitter.getDOMNode();

    this.resizer = new Tracker(splitter, {
      onDragStart: this.onDragStart,
      onDragOver: this.onDragOver,
      onDrop: this.onDrop
    });
  },

  componentWillUnmount: function() {
    if (this.resizer) {
      this.resizer.destroy();
      this.resizer = null;
    }
  },

  // Resizing

  onDragStart: function(/*tracker*/) {
    var splitter = this.refs.splitter.getDOMNode();
    var body = splitter.ownerDocument.body;
    body.setAttribute("resizing", "true");

    var rightPanel = this.refs.rightPanel.getDOMNode();
    this.rightWidth = rightPanel.clientWidth;
  },

  onDragOver: function(newPos/*, tracker*/) {
    var rightPanel = this.refs.rightPanel.getDOMNode();
    var newWidth = (this.rightWidth - newPos.x);
    if (newWidth < this.props.min) {
      return;
    }

    rightPanel.style.width = newWidth + "px";
  },

  onDrop: function(/*tracker*/) {
    var splitter = this.refs.splitter.getDOMNode();
    var body = splitter.ownerDocument.body;
    body.removeAttribute("resizing");
  },

  // Rendering

  render: function() {
    var leftPanel = this.props.leftPanel;
    var rightPanel = this.props.rightPanel;
    var splitterClassNames = ["splitter", this.props.mode];

    return (
      DIV({className: "splitterBox", ref: "splitterBox"},
        DIV({className: "leftPanel", ref: "leftPanel"},
          leftPanel
        ),
        DIV({className: splitterClassNames.join(" "), ref: "splitter"},
          this.props.innerBox
        ),
        DIV({className: "rightPanel", ref: "rightPanel"},
          rightPanel
        )
      )
    );
  }
});

// Exports from this module
exports.Splitter = React.createFactory(Splitter);
});
