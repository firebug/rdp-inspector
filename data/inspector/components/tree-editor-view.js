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
        editingKeyPath: {}
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

      return rows.reduce((acc, row) => {
        var {
          level, key, value, keyPath,
          opened, editing, hasChildren, newField
        } = row;

        if (newField) {
          acc.push(TableRowNewField({
            level: level,
            key: keyPath.join("-") +"_newField",
            onSubmit: (newKey) => this.onNewField(keyPath, newKey, undefined)
          }));

          return acc;
        }

        if (editing == "label") {
          acc.push(TableRowEditingFieldLabel({
            key: keyPath.join("-") + "_editingLabel",
            level: level, label: key, keyPath: keyPath,
            hasChildren: hasChildren, value: value,
            onSubmit: (newKey) => {
              this.onStopEditingFieldLabel(keyPath, value, newKey);
            }
          }));

          return acc;
        }

        acc.push(TableRow({
          key: keyPath.join("-"), value: value,
          level: level, label: key, keyPath: keyPath,
          hasChildren: hasChildren, opened: opened,
          onRowLabelClick: this.onToggleOpenField,
          onRowLabelDblClick: this.onStartEditingFieldLabel,
          onRowValueClick: this.onStartEditingFieldValue,
          onRowRemoveClick: this.onRemoveField
        }));

        return acc;
      }, [])
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
      if (this.state.currentState.get("editingKeyPath").size > 0) {
        // nop if there's aleady an editing key path active
        return;
      }

      // start editing label on key path
      var newState = this.state.currentState.setIn(
        ["editingKeyPath"].concat(keyPath),
        "label");

      this.setState({
        currentState: newState
      });
    },

    onStopEditingFieldLabel: function(keyPath, oldKey, newKey) {
      // start editing label on key path
      var parentKeyPath = keyPath.slice(0, -1);
      var changed = oldKey !== newKey;

      var newState = this.state.currentState.withMutations((state) => {
        state.updateIn(["editingKeyPath"], (v) => v.clear());
        if (changed) {
          var value = state.getIn(["data"].concat(keyPath));
          state.deleteIn(["data"].concat(keyPath));
          state.setIn(["data"].concat(parentKeyPath, newKey), value);
        }
      });

      if (changed) {
        var newHistory = this.state.stateHistory.withMutations(function(v) {
          v.get('history').push(newState);
          v.set('index', v.get('history').size);
        });
      }

      this.setState({
        currentState: newState,
        stateHistory: newHistory
      });

    },

    onStartEditingFieldValue: function(keyPath, value) {
      console.log("START EDITING ROW VALUE", arguments);
      if (this.state.currentState.get("editingKeyPath").size > 0) {
        // nop if there's aleady an editing key path active
        return;
      }

      // start editing label on key path
      var newState = this.state.currentState.setIn(
        ["editingKeyPath"].concat(keyPath),
        "value");

      this.setState({
        currentState: newState
      });
    },

    flattenTreeValue: function (level, key, value, keyPath) {
      keyPath = keyPath || [];

      var openedKeyPaths = this.state.currentState.get("openedKeyPaths");
      var editingKeyPath = this.state.currentState.get("editingKeyPath");

      var res = [];
      var hasChildren = (
        value instanceof Immutable.List ||
          value instanceof Immutable.Map
      );

      var opened = hasChildren && openedKeyPaths.getIn(keyPath);
      var editing = editingKeyPath.getIn(keyPath);

      if (level >= 0) {  // skip the fake root data object level
        res.push({ key: key, level: level, value: value,
                   opened: opened, editing: editing,
                   keyPath: keyPath, hasChildren: hasChildren});
      }

      if (level == -1 || (opened && !editing)) {
        res.push({ newField: true, level: level + 1, keyPath: keyPath });

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
      var { level, label } = this.props;

      var rowClassName = "memberRow newRow";

      var inputEl = INPUT({
        defaultValue: label,
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
