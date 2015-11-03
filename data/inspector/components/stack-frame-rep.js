/* See license.txt for terms of usage */

define(function(require, exports /*, module */) {

"use strict";

// ReactJS
const React = require("react");

// Firebug SDK
const { Reps } = require("reps/reps");
const { ObjectBox } = require("reps/object-box");

// Constants
const { span } = React.DOM;

// RDP Window injected APIs
const { postChromeMessage } = require("shared/rdp-inspector-window");

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
        span({className: "stackName"}, name + "()"),
        span({className: "stackLabel", onClick: this.onViewSource}, label)
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

// helper classes using in the packets reducers

// StackTrace

// xxxHonza: revisit frame filtering should and find solid way.
function StackTrace(frames, packetType) {
  // Remove all frames before 'EventEmitter_emit()' frame.
  // These are part of the infrastructure (always there).
  if (packetType == "send") {
    //frames = filterFrames(frames, "DebuggerClient.requester/<");
    //frames = filterFrames(frames, "EventEmitter_emit");
    //frames = filterFrames(frames, "makeInfallible/<", true);
  }

  // Filter out empty frames
  frames = frames.filter(frame => !!frame.name);

  // Create StackFrame instances, so the right rep is used for
  // rendering (see {@StackFrameRep}.
  this.frames = frames.map(frame => new StackFrame(frame));
}

StackTrace.prototype = {
  hasFrames: function() {
    return this.frames.length > 0;
  },

  getTopFrame: function() {
    return this.hasFrames() ? this.frames[0] : null;
  },
};

// StackFrame

function StackFrame(frame) {
  this.url = frame.fileName;
  this.lineNumber = frame.lineNumber;
  this.columnNumber = frame.columnNumber;
  this.name = frame.name;
}

StackFrame.prototype = {
  getLabel: function() {
    var path = this.url;
    var index = path ? path.lastIndexOf("/") : -1;
    var label = (index == -1) ? path : path.substr(index + 1);

    if (this.lineNumber) {
      label += ":" + this.lineNumber;
    }

    if (this.columnNumber) {
      label += ":" + this.columnNumber;
    }

    return label;
  },

  getUrl: function() {
    return this.url;
  }
};

// Helpers

/* NOTE: currently unused */
/*
function filterFrames(frames, pivot, onlyFirst) {
  var frame;

  if (onlyFirst) {
    for (frame of frames) {
      if (frame.name == pivot) {
        frames.shift();
      } else {
        break;
      }
    }
    return frames;
  }

  var newFrames = [];
  var remove = true;
  for (frame of frames) {
    if (!remove) {
      newFrames.push(frame);
    }

    if (frame.name == pivot) {
      remove = false;
    }
  }

  // The pivot frame wasn't found.
  if (remove) {
    newFrames = frames;
  }

  return newFrames;
}
*/


// Exports from this module
exports.StackFrameRep = StackFrameRep;
exports.StackTrace = StackTrace;
exports.StackFrame = StackFrame;

});
