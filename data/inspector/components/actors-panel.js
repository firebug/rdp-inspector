/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");

// RDP Inspector
const { ActorsToolbar } = require("./actors-toolbar");

const { Locale } = require("shared/rdp-inspector-window");

// Shortcuts
const { tr, td, table, tbody, thead, th, div, h4 } = React.DOM;

const GLOBAL_ACTORS_POOLS = "global-actors-pool";
const TAB_ACTORS_POOLS = "tab-actors-pool";
const ACTORS_FACTORIES = "actors-factories";

var PanelTypesLabels = {};
PanelTypesLabels[GLOBAL_ACTORS_POOLS] = Locale.$STR("rdpInspector.label.MainProcess");
PanelTypesLabels[TAB_ACTORS_POOLS] = Locale.$STR("rdpInspector.label.ChildProcess");
PanelTypesLabels[ACTORS_FACTORIES] = Locale.$STR("rdpInspector.label.ActorsFactories");

/**
 * @template This template renders 'Actors' tab body.
 */
var ActorsPanel = React.createClass({
/** @lends ActorsPanel */

  displayName: "ActorsPanel",

  getInitialState: function() {
    return {
      panelType: GLOBAL_ACTORS_POOLS
    };
  },

  render: function() {
    var { actors } = this.props;
    var { panelType } = this.state;

    var el;

    switch(panelType) {
    case GLOBAL_ACTORS_POOLS:
      el = ActorsPools({
        data: (actors && actors.global),
        key: "global",
        searchFilter: this.props.searchFilter
      });
      break;
    case TAB_ACTORS_POOLS:
      el = ActorsPools({
        data: (actors && actors.tab),
        key: "tab",
        searchFilter: this.props.searchFilter
      });
      break;
    case ACTORS_FACTORIES:
      el = ActorsFactories({
        key: "factories",
        data: {
          global: actors && actors.global,
          tab: actors && actors.tab
        },
        searchFilter: this.props.searchFilter
      });
      break;
    }

    return (
      div({ className: "actorsPanelBox" },
        ActorsToolbar({ actions: this.props.actions,
          currentPanelType: panelType,
          panelTypesLabels: PanelTypesLabels,
          onPanelTypeSelected: this.onPanelTypeSelected
        }),
        div({ className: "actorsScrollBox" }, el)
      )
    );
  },

  onPanelTypeSelected: function(panelType) {
    this.setState({
      panelType: panelType
    });
  }
});

/**
 * @template This template renders 'ActorsPools' list in the tab content.
 */
var ActorsPools = React.createFactory(React.createClass({
  /** @lends ActorsPools */

  displayName: "ActorsPools",

  render: function() {
    var pools = [];

    if (this.props.data) {
      var { actorPool, extraPools } = this.props.data;
      pools = pools.concat(actorPool, extraPools);
    }

    var poolTables = pools.map((poolData) => {
      var pool = poolData.pool;
      var poolId = poolData.id;
      var actorClass = false;

      if (!Array.isArray(pool)) {
        pool = [pool];
        actorClass = true;
      }

      if (pool.length > 0) {
        return PoolTable({
          pool: pool,
          actorClass: actorClass,
          id: poolId,
          key: poolId,
          searchFilter: this.props.searchFilter
        });
      }
    }).filter((el) => el);

    return div({ className: "poolContainer" }, poolTables);
  }
}));

/**
 * @template This template renders 'PoolTable' which render a table related
 * to a single pool of actors.
 */
var PoolTable = React.createFactory(React.createClass({
  /** @lends ActorsPanel */

  displayName: "PoolTable",

  render: function() {
    var rows = [];

    // Iterate array of actors.
    var actors = this.props.pool;
    for (var i in actors) {
      if (this.props.searchFilter &&
          JSON.stringify(actors[i]).toLowerCase()
              .indexOf(this.props.searchFilter.toLowerCase()) < 0) {
        // filter out packets which don't match the filter
        continue;
      }
      actors[i].key = actors[i].actorID;
      rows.push(PoolRow(actors[i]));
    }

    // Pools are mixed with Actor objects (created using CreateClass).
    var className = "poolTable";
    if (this.props.actorClass) {
      className += " actorClass";
    }

    var id = this.props.id ? "ID: " + this.props.id : "";

    return (
      div({},
        h4({}, "Pool" + id),
        table({className: className},
          thead({className: "poolRow"},
            th({width: "20%"}, "Actor ID"),
            th({width: "20%"}, "Prefix"),
            th({width: "20%"}, "TypeName"),
            th({width: "20%"}, "Parent"),
            th({width: "20%"}, "Constructor")
          ),
          tbody(null, rows)
        )
      )
    );
  }
}));

/**
 * @template This template renders a single row of the 'PoolTable' .
 */
var PoolRow = React.createFactory(React.createClass({
  /** @lends PoolRow */

  displayName: "PoolRow",

  render: function() {
    var actor = this.props;
    return (
      tr({className: "poolRow"},
        td({}, actor.actorID),
        td({}, actor.actorPrefix),
        td({}, actor.typeName),
        td({}, actor.parentID),
        td({}, actor.constructor)
      )
    );
  }
}));

/**
 * @template This template renders a single 'FactoryTable' component.
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
 * @template This template renders the 'ActorsFactories' list of tables.
 */
var ActorsFactories = React.createFactory(React.createClass({
  /** @lends ActorsFactories */

  displayName: "ActorsFactories",

  render: function() {
    var main = this.props.data.global || { factories: {} };
    var child = this.props.data.tab || { factories: {} };
    var searchFilter = this.props.searchFilter;

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

/**
 * @template This template renders a single row of the 'FactoryTable'.
 */
var FactoryRow = React.createFactory(React.createClass({
  /** @lends ActorsPanel */

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

// Exports from this module
exports.ActorsPanel = React.createFactory(ActorsPanel);
exports.ActorsPanelComponent = ActorsPanel;

});
