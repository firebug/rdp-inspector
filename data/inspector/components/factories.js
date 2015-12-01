/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
var React = require("react");
var ReactDOM = require("react-dom");

// Consts
const { tr, td, table, tbody, thead, th, div, h4 } = React.DOM;

// Templates

/**
 * TODO docs
 */
var FactoryRow = React.createFactory(React.createClass({
/** @lends FactoryRow */

  displayName: "FactoryRow",

  render: function() {
    var factory = this.props;
    return (
      tr({className: "poolRow"},
        td({}, factory.name),
        td({}, factory.prefix),
        td({}, factory.ctor)
      )
    );
  }
}));

/**
 * TODO docs
 * xxxHonza: localization
 */
var FactoryTable = React.createFactory(React.createClass({
/** @lends FactoryTable */

  displayName: "FactoryTable",

  render: function() {
    var rows = [];

    var factories = this.props.factories;
    for (var i in factories) {
      if (this.props.searchFilter &&
          JSON.stringify(factories[i]).toLowerCase()
              .indexOf(this.props.searchFilter.toLowerCase()) < 0) {
        // filter out packets which don't match the filter
        continue;
      }

      factories[i].key = factories[i].prefix + factories[i].name;
      rows.push(FactoryRow(factories[i]));
    }

    return (
      table({className: "poolTable"},
        thead({className: "poolRow"},
          th({width: "33%"}, "Name"),
          th({width: "33%"}, "Prefix"),
          th({width: "33%"}, "Constructor")
        ),
        tbody(null, rows)
      )
    );
  }
}));

/**
 * TODO docs
 */
var FactoryList = React.createFactory(React.createClass({
/** @lends FactoryList */

  displayName: "FactoryList",

  getInitialState: function() {
    return {
      main: {factories: {}},
      child: {factories: {}},
      searchFilter: null
    };
  },
  render: function() {
    var main = this.state.main;
    var child = this.state.child;
    var searchFilter = this.state.searchFilter;

    // xxxHonza: localization
    return (
      div({className: "poolContainer"},
        h4(null, "Main Process - Global Factories"),
        FactoryTable({ factories: main.factories.global, searchFilter: searchFilter }),
        h4(null, "Main Process - Tab Factories"),
        FactoryTable({ factories: main.factories.tab, searchFilter: searchFilter }),
        h4(null, "Child Process - Global Factories"),
        FactoryTable({ factories: child.factories.global, searchFilter: searchFilter }),
        h4(null, "Child Process - Tab Factories"),
        FactoryTable({ factories: child.factories.tab, searchFilter: searchFilter })
      )
    );
  }
}));

// TODO: turn this into a more React approach
var Factories = {
  render: function(parentNode) {
    return ReactDOM.render(FactoryList(), parentNode);
  }
};

// Exports from this module
exports.Factories = Factories;

});
