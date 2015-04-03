/* See license.txt for terms of usage */

define(function(require, exports, module) {

  // Dependencies
  const React = require("react");
  const ReactBootstrap = require("react-bootstrap");
  const Immutable = require("immutable");

  // Firebug SDK
  const { Reps } = require("reps/repository");

  // Shortcuts
  const { UL, LI, SPAN, DIV,
          TABLE, TBODY, THEAD, TFOOT, TR, TD,
          INPUT, TEXTAREA } = Reps.DOM;

  var TreeEditorView = React.createClass({
    displayName: "TreeEditorView",

    propsToState: function(nextProps) {
      var data = nextProps.data;

      // no packet selected or received packet selected
      if (!data && nextProps.defaultData) {
        data = nextProps.defaultData;
      }

      var currentState = Immutable.fromJS({
        data: data,
        openedKeyPaths: {},
        editingKeyPath: null
      });

      var stateHistory = Immutable.fromJS({
        history: [],
        index: -1
      });

      this.setState({
        currentState: currentState,
        stateHistory: stateHistory
      });
    },

    componentWillReceiveProps: function(nextProps) {
      this.propsToState(nextProps);
    },

    render: function() {
      var rootValue = this.state ? this.state.currentState.get("data") : null;
      var rows = rootValue ?
            flattenImmutableValue(-1, "packet", rootValue ) : [];

      console.log("TREE EDITOR VIEW", rows, this.props, this.state);

      return (
        DIV({className: "row"}, "TODO")
      );
    }
  });

  // Exports from this module
  exports.TreeEditorView = React.createFactory(TreeEditorView);

  // private helpers

  function flattenImmutableValue(level, key, value, keyPath) {
    var res = [];
    var hasChildren = (
      value instanceof Immutable.List ||
      value instanceof Immutable.Map
    );

    keyPath = keyPath || [];

    if (level >= 0) {  // skip the fake root packet object level
      res.push({ key: key, level: level, value: value,
                 keyPath: keyPath, hasChildren: hasChildren});
    }

    if (hasChildren) {
      value.forEach(function (value, subkey) {
        res = res.concat(
          flattenImmutableValue(level + 1, subkey, value,
                                keyPath.concat(subkey))
        );
      });
    }

    return res;
  }

});
