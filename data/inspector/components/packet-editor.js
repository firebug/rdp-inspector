/* See license.txt for terms of usage */

define(function(require, exports, module) {

  // Dependencies
  const React = require("react");
  const ReactBootstrap = require("react-bootstrap");

  // Firebug SDK
  const { Reps } = require("reps/repository");
  const { TreeView } = require("reps/tree-view");

  // Shortcuts
  const { DIV } = Reps.DOM;

  const ButtonToolbar = React.createFactory(ReactBootstrap.ButtonToolbar);
  const Button = React.createFactory(ReactBootstrap.Button);

  /**
   * TODO docs
   */

  var PacketEditorToolbar = React.createFactory(React.createClass({
    displayName: "PacketEditorToolbar",

    render: function() {
      return ButtonToolbar({className: "toolbar"}, [
        Button({ onClick: this.props.onSend, key: "send",
                 bsStyle: "primary", bsSize: "xsmall",
                 style: { marginLeft: 12, color: 'white' } }, "Send"),

        Button({ onClick: this.props.onAddField, key: "add",
                 bsStyle: "default", bsSize: "xsmall",
                 style: { marginLeft: 12 } }, "Add Field"),

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
   * @template TODO
   *
   */
  var PacketEditor = React.createClass({
    displayName: "PacketEditor",

    getInitialState: function() {
      return {
        selectedPacket: null
      };
    },

    render: function() {
      var selectedPacket = this.props.selectedPacket || {};

      return (
        DIV({className: "details editor"},
            PacketEditorToolbar({}),
            TreeView({key: "packet-editor", data: selectedPacket})
           )
      );
    }
  });

  // Exports from this module
  exports.PacketEditor = React.createFactory(PacketEditor);


});
