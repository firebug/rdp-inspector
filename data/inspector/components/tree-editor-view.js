/* See license.txt for terms of usage */

define(function(require, exports, module) {

  // Dependencies
  const React = require("react");
  const ReactBootstrap = require("react-bootstrap");
  const Immutable = require("immutable");

  // Firebug SDK
  const { Reps } = require("reps/repository");

  // Shortcuts
  const { UL, LI, SPAN, DIV, I,
          TABLE, TBODY, THEAD, TFOOT, TR, TD,
          INPUT, TEXTAREA } = Reps.DOM;

  var TreeEditorView = React.createClass({
    displayName: "TreeEditorView",

    propsToState: function(nextProps) {
      nextProps = nextProps || {};
      var data = nextProps.data;

      // no data selected and no default data configured
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
          className: "domTable editable",
          cellPadding: 0, cellSpacing: 0
        }, TBODY({}, this.renderTableRows()))
      );
    },

    renderTableRows: function() {
      var rootValue = this.state ? this.state.currentState.get("data") : null;
      var rows = rootValue ?
            this.flattenTreeValue(-1, "data", rootValue ) : [];

      console.log("TREE EDITOR VIEW", rows, this.props, this.state);

      return rows.reduce((acc, row) => {
        var {
          level, key, value, keyPath,
          opened, hasChildren
        } = row;

        acc.push(TableRow({
          key: keyPath.join("-") || "root",
          level: level, label: key, keyPath: keyPath,
          hasChildren: hasChildren, opened: opened,
          value: value, actions: this.props.actions,
          onRowLabelClick: this.onToggleOpenField,
          onRowLabelDblClick: this.onStartEditingFieldLabel,
          onRowValueClick: this.onStartEditingFieldValue,
          onRowRemoveClick: this.onRemoveField
        }));

        return acc;
      }, [TableRowNewField({
        level: 0,
        key: "new-field",
        onSubmit: (newKey) => this.onNewField([], newKey, undefined)
      })])
    },

    onNewField: function(keyPath, key, value) {
      var fullKeyPath = ["data"].concat(keyPath, key);

      if (this.state.currentState.hasIn(fullKeyPath)) {
        // nop if the key already exists
        return;
      }

      var newState = this.state.currentState.setIn(fullKeyPath, value);

      var newHistory = this.state.stateHistory.withMutations(function(v) {
        v.get('history').push(newState);
        v.set('index', v.get('history').size);
      });

      this.setState({
        currentState: newState,
        stateHistory: newHistory
      });
    },

    onRemoveField: function(keyPath) {
      var fullKeyPath = ["data"].concat(keyPath);

      if (!this.state.currentState.hasIn(fullKeyPath)) {
        // nop if the key doesn't exists
        return;
      }

      var newState = this.state.currentState.deleteIn(fullKeyPath);

      var newHistory = this.state.stateHistory.withMutations(function(v) {
        v.get('history').push(newState);
        v.set('index', v.get('history').size);
      });

      this.setState({
        currentState: newState,
        stateHistory: newHistory
      });
    },

    onToggleOpenField: function(keyPath, label) {
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

    onStartEditingFieldLabel: function(keyPath, label) {
      console.log("START EDITING ROW LABEL", arguments);
    },

    onStartEditingFieldValue: function(keyPath, value) {
      console.log("START EDITING ROW VALUE", arguments);
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

      if (level >= 0) {  // skip the fake root data object level
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

  var TableRowNewField = React.createFactory(React.createClass({
    displayName: "TableRowNewField",
    render: function() {
      var { level } = this.props;

      var rowClassName = "memberRow newRow";

      var inputEl = INPUT({
        placeholder: "New...",
        onKeyPress: this.onKeyPress
      });

      return TR({ className: rowClassName }, [
        TD({
          key: 'new-label',
          className: "memberLabelCell",
          colSpan: 2,
          style: { paddingLeft: 18 + (8 * level) }
        }, inputEl)
      ]);
    },
    onKeyPress: function(event) {
      if(event.which == 13) {

        if (typeof this.props.onSubmit == "function") {
          this.props.onSubmit(event.target.value);
        }

        event.target.value = null;
      }
    }
  }));

  var TableRowEditingFieldLabel = React.createFactory(React.createClass({
    displayName: "TableRowEditingField",
    render: function() {
      var { level, value } = this.props;

      var rowClassName = "memberRow newRow";

      var inputEl = INPUT({
        value: value,
        onKeyPress: this.onKeyPress
      });

      return TR({ className: rowClassName }, [
        TD({
          key: 'new-label',
          className: "memberLabelCell",
          colSpan: 2,
          style: { paddingLeft: 18 + (8 * level) }
        }, inputEl)
      ]);
    },
    onKeyPress: function(event) {
      if(event.which == 13) {

        if (typeof this.props.onSubmit == "function") {
          this.props.onSubmit(event.target.value);
        }

        event.target.value = null;
      }
    }
  }));

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
        onDoubleClick: () => this.props.onRowLabelDblClick(keyPath, label),
        onClick: () => this.props.onRowLabelClick(keyPath, label)
      }, SPAN({ className: 'memberLabel domLabel'}, label));
    },

    renderRowValue: function() {
      var { hasChildren, value, keyPath } = this.props;

      var jsonValue = hasChildren ? value.toJSON() : value;

      var valueSummary = Reps.getRep(jsonValue)({ object: jsonValue });

      return TD({ key: 'value', className: "memberValueCell" },
                SPAN({ className: 'memberLabel domLabel',
                       onClick: () => this.props.onRowValueClick(keyPath, value)
                     }, valueSummary),
                I({ className: "closeButton",
                    onClick: () => this.props.onRowRemoveClick(keyPath) })
               );
    }
  }));
});
