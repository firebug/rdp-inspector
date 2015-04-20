/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const ReactBootstrap = require("react-bootstrap");

// Firebug SDK

const { Reps } = require("reps/repository");
const { TreeView } = require("reps/tree-view");

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
PanelTypesLabels[GLOBAL_ACTORS_POOLS] = "Global Actors";
PanelTypesLabels[TAB_ACTORS_POOLS] = "Tab Actors";
PanelTypesLabels[ACTORS_FACTORIES] = "Actors Factories";

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
      el = ActorsPools({ data: (actors && actors.global), key: 'global' });
      break;
    case TAB_ACTORS_POOLS:
      el = ActorsPools({data: (actors && actors.tab), key: 'tab' });
      break;
    case ACTORS_FACTORIES:
      el = ActorsFactories({
        key: 'factories',
        data: {
          global: actors && actors.global,
          tab: actors && actors.tab
        }
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

var ActorsPools = React.createFactory(React.createClass({
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

      return PoolTable({
        pool: pool,
        actorClass: actorClass,
        id: poolId,
        key: poolId,
        searchFilter: this.state && this.state.searchFilter
      });
    });

    return DIV({ className: "poolContainer" }, poolTables);
  }
}));

var PoolTable = React.createFactory(React.createClass({
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

var PoolRow = React.createFactory(React.createClass({
  displayName: "PoolRow",
  render: function() {
    var actor = this.props;
    return (
      TR({className: "poolRow"},
        TD({}, actor.actorID),
        TD({}, actor.actorPrefix),
        TD({}, actor.typeName),
        TD({}, actor.parentID),
        TD({}, actor.constructor)
      )
    );
  }
}));

var ActorsFactories = React.createFactory(React.createClass({
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

var FactoryTable = React.createFactory(React.createClass({
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

var FactoryRow = React.createFactory(React.createClass({
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
