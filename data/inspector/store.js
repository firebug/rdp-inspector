/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Redux
const { createStore } = require("redux");

// RDP Inspector
const { rootReducer } = require("./reducers/index");

function configureStore(initialState) {
  return createStore(rootReducer, initialState);
}

// Exports from this module
exports.configureStore = configureStore;

});
