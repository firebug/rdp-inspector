/* See license.txt for terms of usage */
/* globals postChromeMessage */

define(function(require, exports /*, module */) {

"use strict";

// ReactJS
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/reps");
const { ObjectBox } = require("reps/object-box");

// RDP Inspector
const { StackFrame } = require("../packets-store");

// Constants
const { SPAN } = Reps.DOM;

/**
 * This component is responsible for rendering a stack frame.
 */
var StackFrameRep = React.createClass({
/** @lends StackFrameRep */

  displayName: "StackFrameRep",

  render: function() {
    var stackFrame = this.props.object;
    var name = stackFrame.name;
    var label = stackFrame.getLabel();

    return (
      ObjectBox({className: "stackFrame"},
        SPAN({className: "stackName"}, name + "()"),
        SPAN({className: "stackLabel", onClick: this.onViewSource}, label)
      )
    );
  },

  onViewSource: function(event) {
    event.stopPropagation();
    event.preventDefault();

    // xxxHonza: how to get reference to the action list?
    /*this.props.actions.onViewSource({
      url: topFrame.fileName,
      lineNumber: topFrame.lineNumber
    });*/

    var frame = this.props.object;
    postChromeMessage("view-source", {
      url: frame.url,
      lineNumber: frame.lineNumber
    });
  }
});

// Registration

function supportsObject(object/*, type*/) {
  return object instanceof StackFrame;
}

Reps.registerRep({
  rep: React.createFactory(StackFrameRep),
  supportsObject: supportsObject
});

// Exports from this module
exports.StackFrameRep = StackFrameRep;
});
