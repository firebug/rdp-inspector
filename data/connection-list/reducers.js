/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// actions types
const { types } = require("./actions");

/**
 * Initial state definition
 */
const initialState = {};

function connections(state = initialState, action) {
  switch(action.type) {
  case types.SET_CONNECTIONS:
    return action.connections;
  default:
    return state;
  }
}

// Export combined reducers

// Redux
const { combineReducers } = require("redux");

exports.rootReducer = combineReducers({
  connections
});

});
