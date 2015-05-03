/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK
const { Reps } = require("reps/repository");
const { TreeEditorView } = require("./tree-editor-view");

// Constants
const { DIV } = Reps.DOM;

const ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
const Button = React.createFactory(ReactBootstrap.Button);

/**
 * @template This template represents the Packet Editor toolbar
 */

var PacketEditorToolbar = React.createFactory(React.createClass({
/** @lends PacketEditrView */

  displayName: "PacketEditorToolbar",

  render: function() {
    return ButtonToolbar({className: "toolbar"}, [
      Button({ onClick: this.props.onSend, key: "send",
               bsStyle: "primary", bsSize: "xsmall",
               style: { marginLeft: 12, color: 'white' } }, "Send"),

      Button({ onClick: this.props.onRedo, key: "redo",
               className: "pull-right",
               disabled: !this.props.isRedoEnabled,
               bsStyle: "default", bsSize: "xsmall",
               style: { marginRight: 6 } }, "Redo"),
      Button({ onClick: this.props.onUndo, key: "undo",
               className: "pull-right",
               disabled: !this.props.isUndoEnabled,
               bsStyle: "default", bsSize: "xsmall",
               style: { marginRight: 6 } }, "Undo"),
      Button({ onClick: this.props.onClear, key: "clear",
               className: "pull-right",
               bsStyle: "danger", bsSize: "xsmall",
               style: { marginRight: 6, color: 'white' } }, "Clear")
    ]);
  }
}));

/**
 * @template This template represents the PacketEditor sidebar
 */
var PacketEditor = React.createClass({
  displayName: "PacketEditor",

  getInitialState: function() {
    return {
      selectedPacket: null,
      defaultData: {
        to: "root",
        type: "requestTypes"
      }
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      selectedPacket: this.props.selectedPacket
    });
  },

  render: function() {
    var selectedPacket = this.state.selectedPacket || this.props.selectedPacket;
    var { actorIDs } = this.props;

    return (
      DIV({className: "details editor"},
          PacketEditorToolbar({
            onClear: this.onClear,
            onSend: this.onSend,
            onUndo: this.onUndo,
            onRedo: this.onRedo,
            isUndoEnabled: true,
            isRedoEnabled: true
          }),
          TreeEditorView({
            ref: "editor",
            key: "packet-editor",
            data: selectedPacket && selectedPacket.to ? selectedPacket : null,
            defaultData: this.state.defaultData,
            handleAutocompletion: (suggestionType, keyPath, value) => {
              if (!actorIDs && suggestionType != "value") {
                return [];
              }

              try {
                var parsedValue;

                parsedValue = typeof value == "string" ?
                  value.slice(1, value.length - 1) : "";

                if(keyPath.length == 1 && keyPath[0] == "to") {
                  // get a suggestion list by filtering actorIDs list
                  return actorIDs.filter((suggestion) => {
                    return suggestion.indexOf(parsedValue) == 0
                  })
                }
              } catch(e) {

              }

              return []
            }
          })
         )
    );
  },

  onUndo: function() {
    this.refs.editor.undo();
  },

  onRedo: function() {
    this.refs.editor.redo();
  },

  onClear: function() {
    this.refs.editor.clearData();
  },

  onSend: function() {
    this.props.actions.send(this.refs.editor.getData());
  }
});

// Exports from this module
exports.PacketEditor = React.createFactory(PacketEditor);

});
