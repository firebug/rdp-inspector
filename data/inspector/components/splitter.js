/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// RDP Inspector
const { Tracker } = require("../tracker");

// Constants
const { Reps } = require("reps/reps");
const { DIV } = Reps.DOM;

/**
 * @template xxxHonza TODO docs
 */
var Splitter = React.createClass({
/** @lends Splitter */

  displayName: "Splitter",

  componentDidMount: function() {
    var splitter = this.refs.splitter.getDOMNode();

    this.resizer = new Tracker(splitter, {
      onDragStart: this.onDragStart.bind(this),
      onDragOver: this.onDragOver.bind(this),
      onDrop: this.onDrop.bind(this)
    });
  },

  componentWillUnmount: function() {
    var tabbedArea = this.refs.splitter.getDOMNode();
    this.resizer.destroy();
    this.resizer = null;
  },

  // Resizing

  onDragStart: function(tracker) {
    var splitter = this.refs.splitter.getDOMNode();
    var body = splitter.ownerDocument.body;
    body.setAttribute("resizing", "true");

    var rightPanel = this.refs.rightPanel.getDOMNode();
    this.rightWidth = rightPanel.clientWidth;
  },

  onDragOver: function(newPos, tracker) {
    var rightPanel = this.refs.rightPanel.getDOMNode();
    var newWidth = (this.rightWidth - newPos.x);
    if (newWidth < this.props.min) {
      return;
    }

    rightPanel.style.width = newWidth + "px";
  },

  onDrop: function(tracker) {
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
    )
  },
});

// Exports from this module
exports.Splitter = React.createFactory(Splitter);
});
