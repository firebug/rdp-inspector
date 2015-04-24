/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK

const { Reps } = require("reps/repository");

// RDP Inspector
const { ActorsToolbar } = require("./actors-toolbar");

// Shortcuts
const { TR, TD, SPAN, TABLE, TBODY, THEAD, TH, DIV, H4 } = Reps.DOM;
const TabbedArea = React.createFactory(ReactBootstrap.TabbedArea);
const TabPane = React.createFactory(ReactBootstrap.TabPane);

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
    }
  },

  render: function() {
    var { actors } = this.props;
    var { panelType } = this.state;

    var el;

    switch(panelType) {
    case GLOBAL_ACTORS_POOLS:
      el = ActorsPools({
        data: (actors && actors.global),
        key: 'global',
        searchFilter: this.props.searchFilter
      });
      break;
    case TAB_ACTORS_POOLS:
      el = ActorsPools({
        data: (actors && actors.tab),
        key: 'tab',
        searchFilter: this.props.searchFilter
      });
      break;
    case ACTORS_FACTORIES:
      el = ActorsFactories({
        key: 'factories',
        data: {
          global: actors && actors.global,
          tab: actors && actors.tab
        },
        searchFilter: this.props.searchFilter
      });
      break;
    }

    return (
      DIV({ className: "actorsPanelBox" },
        ActorsToolbar({ actions: this.props.actions,
          currentPanelType: panelType,
          panelTypesLabels: PanelTypesLabels,
          onPanelTypeSelected: this.onPanelTypeSelected,
        }),
        DIV({ className: "actorsScrollBox" }, el)
      )
    );
  },

  onPanelTypeSelected: function(panelType) {
    this.setState({
      panelType: panelType
    })
  }
});

/**
 * @template This template renders 'ActorsPools' list in the tab content.
 */
var ActorsPools = React.createFactory(React.createClass({
  /** @lends ActorsPools */

  displayName: "ActorsPools",

  render: function() {
    var pool = [];

    if (this.props.data) {
      var { actorPool, extraPools } = this.props.data;
      pool = pool.concat(actorPool, extraPools);
    }

    var poolTables = pool.map((poolData) => {
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

    return DIV({ className: "poolContainer" }, poolTables);
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
          JSON.stringify(actors[i]).indexOf(this.props.searchFilter) < 0) {
        // filter out packets which don't match the filter
        continue;
      }
      actors[i].key = actors[i].actorID;
      rows.push(PoolRow(actors[i]));
    };

    // Pools are mixed with Actor objects (created using CreateClass).
    var className = "poolTable";
    if (this.props.actorClass) {
      className += " actorClass";
    }

    var id = this.props.id ? "ID: " + this.props.id : "";

    return (
      DIV({},
        H4({}, "Pool" + id),
        TABLE({className: className},
          THEAD({className: "poolRow"},
            TH({width: "20%"}, "Actor ID"),
            TH({width: "20%"}, "Prefix"),
            TH({width: "20%"}, "TypeName"),
            TH({width: "20%"}, "Parent"),
            TH({width: "20%"}, "Constructor")
          ),
          TBODY(null, rows)
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
      TR({className: "poolRow"},
        TD({}, actor.actorID && actor.actorID.replace(/^server\d*./, "")),
        TD({}, actor.actorPrefix),
        TD({}, actor.typeName),
        TD({}, actor.parentID && actor.parentID.replace(/^server\d*./, "")),
        TD({}, actor.constructor)
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
      DIV({className: "poolContainer"},
        H4(null, "Main Process - Global Factories"),
        FactoryTable({ factories: main.factories.global, searchFilter: searchFilter }),
        H4(null, "Main Process - Tab Factories"),
        FactoryTable({ factories: main.factories.tab, searchFilter: searchFilter }),
        H4(null, "Child Process - Global Factories"),
        FactoryTable({ factories: child.factories.global, searchFilter: searchFilter }),
        H4(null, "Child Process - Tab Factories"),
        FactoryTable({ factories: child.factories.tab, searchFilter: searchFilter })
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
          JSON.stringify(factories[i]).indexOf(this.props.searchFilter) < 0) {
        // filter out packets which don't match the filter
        continue;
      }

      factories[i].key = factories[i].prefix + factories[i].name;
      rows.push(FactoryRow(factories[i]));
    };

    return (
      TABLE({className: "poolTable"},
        THEAD({className: "poolRow"},
          TH({width: "33%"}, "Name"),
          TH({width: "33%"}, "Prefix"),
          TH({width: "33%"}, "Constructor")
        ),
        TBODY(null, rows)
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
      TR({className: "poolRow"},
        TD({}, factory.name),
        TD({}, factory.prefix),
        TD({}, factory.ctor)
      )
    );
  }
}));

// Exports from this module
exports.ActorsPanel = React.createFactory(ActorsPanel);

});
