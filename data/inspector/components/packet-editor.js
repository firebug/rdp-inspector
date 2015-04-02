/* See license.txt for terms of usage */

define(function(require, exports, module) {

  // Dependencies
  const React = require("react");

  // Firebug SDK
  const { Reps } = require("reps/repository");
  const { TreeView } = require("reps/tree-view");

  // Shortcuts
  const { DIV } = Reps.DOM;

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
        DIV({className: "editor"},
            TreeView({key: "packet-editor", data: selectedPacket})
           )
      );
    }
  });

  // Exports from this module
  exports.PacketEditor = React.createFactory(PacketEditor);


});
