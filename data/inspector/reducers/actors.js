/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// actions types
const { types } = require("../actions/actors");

/**
 * Initial state definition
 */
const initialState = {};

function actorsReducer(state = initialState, action) {
  switch(action.type) {
  case types.SET_ACTORS:
    return setActors(state, action.actors);
  case types.CLEAR_ACTORS:
    return clearActors(state);
  default:
    return state;
  }
}

module.exports = actorsReducer;

// helpers
function clearActors() {
  return {};
}

function setActors(state, actors) {
  let { tab, global } = actors;
  let actorIDs = collectActorIDs([
    tab.actorPool,
    tab.extraPools,
    global.actorPool,
    global.extraPools
  ], []);

  return Object.assign({}, state, {
    tab, global, actorIDs
  });
}

function collectActorIDs(data, res) {
  if (data instanceof Array) {
    data.forEach((item) => {
      collectActorIDs(item, res);
    });
  } else if (data instanceof Object) {
    if (data.pool) {
      collectActorIDs(data.pool, res);
    } else if (data.actorID) {
      var { actorID } = data;
      if (res.indexOf(actorID) < 0) {
        res.push(actorID);
      }
    }
  }

  return res;
}
});
