/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Dependencies
const React = require("react");
const { tr, td, table, tbody, thead, th, div, h4 } = React.DOM;

// Templates

/**
 * TODO docs
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
 * TODO docs
 * xxxHonza: localization
 */
var PoolTable = React.createFactory(React.createClass({
/** @lends PoolTable */

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
 * TODO docs
 */
var PoolList = React.createFactory(React.createClass({
/** @lends PoolList */

  displayName: "PoolList",

  getInitialState: function() {
    return {
      pools: []
    };
  },

  render: function() {
    var pools = [];

    for (var i in this.state.pools) {
      var poolData = this.state.pools[i];
      var pool = poolData.pool;
      var poolId = poolData.id;

      var actorClass = false;

      // xxxHonza: there are actors stored as pools.
      // See also: https://bugzilla.mozilla.org/show_bug.cgi?id=1119790#c1
      if (!Array.isArray(pool)) {
        pool = [pool];
        actorClass = true;
      }

      pools.push(PoolTable({
        pool: pool,
        actorClass: actorClass,
        id: poolId,
        key: i,
        searchFilter: this.state.searchFilter
      }));
    }

    return (
      div({className: "poolContainer"},
        pools
      )
    );
  }
}));

var Pools = {
  render: function(parentNode) {
    return React.render(PoolList(), parentNode);
  }
};

// Exports from this module
exports.Pools = Pools;

});
