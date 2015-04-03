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
      nextProps = nextProps || {};
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

      return {
        currentState: currentState,
        stateHistory: stateHistory
      };
    },

    getInitialState: function() {
      return this.propsToState(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState(this.propsToState(nextProps));
    },

    render: function() {
      return (
        TABLE({
          className: "domTable",
          cellPadding: 0, cellSpacing: 0,
          style: { marginBottom: 80 }
        }, TBODY({}, this.renderTableRows()))
      );
    },

    renderTableRows: function() {
      var rootValue = this.state ? this.state.currentState.get("data") : null;
      var rows = rootValue ?
            this.flattenTreeValue(-1, "packet", rootValue ) : [];

      console.log("TREE EDITOR VIEW", rows, this.props, this.state);

      return rows.reduce((acc, row) => {
        var {
          level, key, value, keyPath,
          opened, hasChildren
        } = row;

        if (level < 0) {
          // skip the fake level -1
          return acc;
        }

        acc.push(TableRow({
          key: keyPath.join("-") || "root",
          level: level, label: key, keyPath: keyPath,
          hasChildren: hasChildren, opened: opened,
          value: value, actions: this.props.actions,
          onRowLabelClick: this.onRowLabelClick,
          onRowValueClick: this.onRowValueClick
        }));

        return acc;
      }, [])
    },

    onRowLabelClick: function(keyPath, label) {
      console.log("CLICK ROW LABEL", keyPath);

      // toggle open/close tree view level
      var newState = this.state.currentState.updateIn(
        ["openedKeyPaths"].concat(keyPath),
        (value) => {
          if (value) {
            return null;
          } else {
            return Immutable.fromJS({});
          }
        });

      this.setState({
        currentState: newState
      });
    },

    onRowValueClick: function(keyPath, value) {
      console.log("CLICK ROW VALUE", arguments);
    },

    flattenTreeValue: function (level, key, value, keyPath) {
      keyPath = keyPath || [];

      var openedKeyPaths = this.state ?
            this.state.currentState.get("openedKeyPaths") : null;

      var res = [];
      var hasChildren = (
        value instanceof Immutable.List ||
          value instanceof Immutable.Map
      );

      var opened = openedKeyPaths.getIn(keyPath) && hasChildren;

      if (level >= 0) {  // skip the fake root packet object level
        res.push({ key: key, level: level, value: value,
                   opened: opened,
                   keyPath: keyPath, hasChildren: hasChildren});
      }

      if (opened) {
        value.forEach((value, subkey) => {
          res = res.concat(
            this.flattenTreeValue(level + 1, subkey, value,
                                  keyPath.concat(subkey))
          );
        });
      }

      return res;
    }
  });

  // Exports from this module
  exports.TreeEditorView = React.createFactory(TreeEditorView);

  var TableRow = React.createFactory(React.createClass({
    displayName: "TableRow",

    render: function() {
      var { hasChildren, opened } = this.props;

      var rowClassName = "memberRow domRow";

      if (hasChildren) {
        rowClassName += " hasChildren";
      }

      if (opened) {
        rowClassName += " opened";
      }

      var rowContent = [
        this.renderRowLabel(),
        this.renderRowValue()
      ]

      return TR({ className: rowClassName }, rowContent);
    },

    renderRowLabel: function() {
      var { keyPath, label, level } = this.props;

      return TD({
        key: 'label',
        className: "memberLabelCell",
        style: { paddingLeft: 8 * level },
        onClick: () => this.props.onRowLabelClick(keyPath, label)
      }, SPAN({ className: 'memberLabel domLabel'}, label));
    },

    renderRowValue: function() {
      var { hasChildren, value, keyPath } = this.props;

      var jsonValue = hasChildren ? value.toJS() : value;

      var valueSummary = Reps.getRep(value)({ object: jsonValue });

      return TD({
        key: 'value',
        className: "memberValueCell",
        onClick: () => this.props.onRowValueClick(keyPath, value)
      }, SPAN({ className: 'memberLabel domLabel'}, valueSummary));
    }
  }));
});
