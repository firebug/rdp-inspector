/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// actions types
const { types } = require("../actions/global");

/**
 * Initial state definition
 */
const initialState = {};

function globalReducer(state = initialState, action) {
  switch(action.type) {
  case types.SET_SEARCH_FILTER:
    return setSearchFilter(state, action.filter);
  default:
    return state;
  }
}

module.exports = globalReducer;


function setSearchFilter(state, filter) {
  return Object.assign({}, state, {
    searchFilter: filter
  });
}

});
