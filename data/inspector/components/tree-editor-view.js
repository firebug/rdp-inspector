/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const ReactBootstrap = require("react-bootstrap");
const Immutable = require("immutable");

// Firebug SDK
const { Reps } = require("reps/repository");

// Constants
const { UL, LI, SPAN, DIV, I,
        TABLE, TBODY, THEAD, TFOOT, TR, TD,
        INPUT, TEXTAREA } = Reps.DOM;

/**
 * @template This template represents an editable
 * tree view
 */
var TreeEditorView = React.createClass({
/** @lends TreeEEditorView */

  displayName: "TreeEditorView",

  clearData: function() {
    var data = Immutable.fromJS(this.props.defaultData || {});
    var newState = this.state.currentState.set("data", data);
    var newHistory = !Immutable.is(this.state.currentState, newState) ?
          this.generateUpdatedHistory(newState) :
          this.state.stateHistory;

    this.setState({
      currentState: newState,
      stateHistory: newHistory
    });
  },

  getData: function() {
    return this.state.currentState.get("data").toJSON();
  },

  undo: function() {
    if (this.hasUndo()) {
      var index = this.state.stateHistory.get("index");
      var newHistory = this.state.stateHistory.set("index", index - 1);
      var newState = this.state.stateHistory.getIn(["history", index - 1]);

      this.setState({
        currentState: newState,
        stateHistory: newHistory
      })
    }
  },
  redo: function() {
    if (this.hasRedo()) {
      var index = this.state.stateHistory.get("index");
      var newHistory = this.state.stateHistory.set("index", index + 1);
      var newState = this.state.stateHistory.getIn(["history", index + 1]);

      this.setState({
        currentState: newState,
        stateHistory: newHistory
      })
    }
  },
  hasUndo: function() {
    var size = this.state.stateHistory.get("history").size;
    var index = this.state.stateHistory.get("index");

    if (size > 1 && index > 0) {
      return true;
    }

    return false;
  },
  hasRedo: function() {
    var size = this.state.stateHistory.get("history").size;
    var index = this.state.stateHistory.get("index");

    if (size > 1 && index < size - 1) {
      return true;
    }

    return false;
  },

  generateUpdatedHistory: function(newState) {
    return this.state.stateHistory.withMutations(function(v) {
      v.update('history', (history) => {
        // TODO: configurable history size
        if (history.size >= 16) {
          return history.skip(1).push(newState);
        } else {
          return history.push(newState);
        }
      });
      v.set('index', v.get('history').size - 1);
    })
  },

  propsToState: function(nextProps) {
    nextProps = nextProps || {};
    var data = nextProps.data;

    var currentState, stateHistory;

    // no previous state or new data set
    if (!this.state || data) {
      if (!data) {
        data = nextProps.defaultData || {};
      }

      currentState = Immutable.fromJS({
        data: data,
        openedKeyPaths: {},
        editingKeyPath: {}
      });
    } else {
      currentState = this.state.currentState;
    }

    // no previous state or no stateHistory
    if (!this.state || !this.state.stateHistory) {
      stateHistory = Immutable.fromJS({
        history: [currentState],
        index: 0
      });
    } else {
      stateHistory = this.state.stateHistory
    }

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
          onSubmit: (newKey, cancel) => {
            this.onNewField(keyPath, newKey, cancel);
          }
        }));

        return acc;
      }

      if (editing == "label") {
        acc.push(TableRowEditingFieldLabel({
          key: keyPath.join("-") + "_editingLabel",
          level: level, label: key, keyPath: keyPath,
          hasChildren: hasChildren, value: value,
          validation: (value) => {
            // TODO: validator
            return true;
          },
          autocompletion: (value) => {
            var suggestions = this.props.handleAutocompletion ?
              this.props.handleAutocompletion("value", keyPath, value) : [];

            return suggestions;
          },
          onSubmit: (newKey, cancel) => {
            this.onStopEditingFieldLabel(keyPath, key, newKey, cancel);
          }
        }));

        return acc;
      }

      if (editing == "value") {
        acc.push(TableRowEditingFieldValue({
          key: keyPath.join("-") + "_editingValue",
          level: level, label: key, keyPath: keyPath,
          hasChildren: hasChildren, value: value,
          validation: (value) => {
            // TODO: add support to custom validators
            var valid;

            try {
              JSON.parse(value);
              valid = true;
            } catch(e) {
              valid = false;
            }

            return valid;
          },
          autocompletion: (value) => {
            // TODO: auto completion
            var suggestions = this.props.handleAutocompletion ?
              this.props.handleAutocompletion("value", keyPath, value) : [];

            return suggestions;
          },
          onSubmit: (newValue, cancel) => {
            this.onStopEditingFieldValue(keyPath, value, JSON.parse(newValue), cancel);
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

  onNewField: function(keyPath, key, cancel) {
    var fullKeyPath = ["data"].concat(keyPath, key);

    if (this.state.currentState.hasIn(fullKeyPath)) {
      // nop if the key already exists
      return;
    }

    var newState = !cancel ?
          this.state.currentState.setIn(fullKeyPath, undefined) :
          this.state.currentState;

    var newHistory = !cancel ?
          this.generateUpdatedHistory(newState) :
          this.state.stateHistory;

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

    var newHistory = this.generateUpdatedHistory(newState);

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

  onStopEditingFieldLabel: function(keyPath, oldKey, newKey, cancel) {
    // start editing label on key path
    var parentKeyPath = keyPath.slice(0, -1);
    var changed = oldKey !== newKey;

    var newState = this.state.currentState.withMutations((state) => {
      state.updateIn(["editingKeyPath"], (v) => v.clear());
      if (!cancel && changed) {
        var value = state.getIn(["data"].concat(keyPath));
        state.deleteIn(["data"].concat(keyPath));
        state.setIn(["data"].concat(parentKeyPath, newKey), value);
      }
    });

    var newHistory = (!cancel && changed) ?
          this.generateUpdatedHistory(newState) :
          this.state.stateHistory;

    this.setState({
      currentState: newState,
      stateHistory: newHistory
    });

  },

  onStartEditingFieldValue: function(keyPath, value) {
    if (this.state.currentState.get("editingKeyPath").size > 0) {
      // nop if there's aleady an editing key path active
      return;
    }

    // start editing value on key path
    var newState = this.state.currentState.setIn(
      ["editingKeyPath"].concat(keyPath),
      "value");

    this.setState({
      currentState: newState
    });
  },

  onStopEditingFieldValue: function(keyPath, oldValue, newValue, cancel) {
    // stop editing value on key path
    var parentKeyPath = keyPath.slice(0, -1);
    var value = Immutable.fromJS(newValue);
    var changed = !Immutable.is(oldValue, value);

    var newState = this.state.currentState.withMutations((state) => {
      state.updateIn(["editingKeyPath"], (v) => v.clear());
      if (!cancel && changed) {
        state.setIn(["data"].concat(keyPath), value);
      }
    });

    var newHistory = (!cancel && changed) ?
          this.generateUpdatedHistory(newState) :
          this.state.stateHistory;

    this.setState({
      currentState: newState,
      stateHistory: newHistory
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

    if (level == -1 || (opened && !editing) || (editing && editing.size > 0)) {
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

// non-exported React components

/**
 * @template This template represents a row which creates a new
 * field in a defined key path
 */
var TableRowNewField = React.createFactory(React.createClass({
/** @lends TableRowNewField */

  displayName: "TableRowNewField",

  getInitialState: function() {
    return {
      valid: true
    }
  },

  render: function() {
    var { level } = this.props;

    var rowClassName = "memberRow newRow";

    var inputEl = INPUT({
      placeholder: "New...",
      onKeyUp: this.onKeyUp
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

  onChange: function(event) {
    var { valid } = this.state;

    valid = this.props.validation ?
      this.props.validation(event.target.value) :
      true

    this.setState({valid: valid});
  },

  onKeyUp: function(event) {
    var { valid } = this.state;

    if(valid && event.which == 13) {

      if (typeof this.props.onSubmit == "function") {
        // submit
        this.props.onSubmit(event.target.value);
      }
      event.target.value = null;
    } else if (event.which == 27) {
      // cancel
      this.props.onSubmit(event.target.value, true);
      event.target.value = null;
    }
  }
}));

/**
 * @template This template respesents a row for a field
 * in a label editing state
 */
var TableRowEditingFieldLabel = React.createFactory(React.createClass({
/** @lends TableRowEditingFieldLabel */

  displayName: "TableRowEditingFieldLabel",

  getInitialState: function() {
    return {
      valid: true
    }
  },

  componentDidMount: function() {
    React.findDOMNode(this.refs.input).focus();
  },

  render: function() {
    var { level, label } = this.props;

    var rowClassName = "memberRow newRow";

    var inputEl = INPUT({
      ref: 'input',
      defaultValue: label,
      onKeyUp: this.onKeyUp
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

  onChange: function(event) {
    var { valid } = this.state;

    valid = this.props.validation ?
      this.props.validation(event.target.value) :
      true

    this.setState({valid: valid});
  },

  onKeyUp: function(event) {
    var { valid } = this.state;

    if(valid && event.which == 13) {
      // submit
      this.props.onSubmit(event.target.value);
    } else if (event.which == 27) {
      // cancel
      this.props.onSubmit(event.target.value, true);
    }
  }
}));

/**
 * @template This template respesents a row for a field
 * in a value editing state
 */
var TableRowEditingFieldValue = React.createFactory(React.createClass({
/** @lends TableRowEditingfieldValue */

  displayName: "TableRowEditingFieldValue",

  getInitialState: function() {
    return  {
      valid: true,
      suggestions: []
    }
  },

  componentDidMount: function() {
    React.findDOMNode(this.refs.input).focus();
  },

  render: function() {
    var { level, label, value } = this.props;

    var rowClassName = "memberRow domRow editRow";

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
      style: { paddingLeft: 8 * level }
    }, SPAN({ className: 'memberLabel domLabel' }, label));
  },

  renderRowValue: function() {
    var { hasChildren, value, keyPath } = this.props;
    var { valid } = this.state;

    var jsonValue = (value instanceof Immutable.Collection) ?
          value.toJSON() : value;

    var inputEl = INPUT({
      ref: 'input',
      defaultValue: JSON.stringify(jsonValue),
      onKeyUp: this.onKeyUp,
      onChange: this.onChange,
      className: valid ? "valid" : "invalid"
    });

    var suggestionsEl = this.renderSuggestions();

    return TD({ key: 'value', className: "memberValueCell" },
              inputEl, I({}), suggestionsEl);
  },

  renderSuggestions: function() {
    var { suggestions } = this.state;
    var style = {
      display: suggestions && suggestions.length > 0 ? "block" : "none",
      width: 195, // TODO: find better size calc
      maxHeight: 200
    }
    var items = suggestions.map((suggestion) => {
      return LI({}, suggestion);
    })

    return UL({ style: style, className: "suggestions" }, items);
  },

  onChange: function(event) {
    var { valid } = this.state;

    valid = this.props.validation ?
      this.props.validation(event.target.value) :
      true
    suggestions = this.props.autocompletion ?
      this.props.autocompletion(event.target.value) :
      []

    this.setState({valid: valid, suggestions: suggestions});
  },

  onKeyUp: function(event) {
    var { valid } = this.state;

    if(valid && event.which == 13) {
      // submit
      this.props.onSubmit(event.target.value);
    } else if (event.which == 27) {
      // cancel
      this.props.onSubmit(event.target.value, true);
    }
  }
}));

/**
 * @template This template respesenta a row for a field
 * in non-editing state
 */
var TableRow = React.createFactory(React.createClass({
/** @lends TableRow */
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
    }, SPAN({ className: 'memberLabel domLabel' }, label));
  },

  renderRowValue: function() {
    var { hasChildren, value, keyPath } = this.props;

    var jsonValue = hasChildren ? value.toJSON() : value;

    var valueSummary = Reps.getRep(jsonValue)({ object: jsonValue });

    return TD({ key: 'value', className: "memberValueCell" },
              SPAN({
                onClick: () => this.props.onRowValueClick(keyPath, value)
              }, valueSummary),
              I({ className: "closeButton",
                  onClick: () => this.props.onRowRemoveClick(keyPath) })
             );
  }
}));

});
