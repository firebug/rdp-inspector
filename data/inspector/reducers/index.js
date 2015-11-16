/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

// Redux
const { combineReducers } = require("redux");

// RDP Inspector
const global = require("./global");
const actors = require("./actors");
const packets = require("./packets");

var rootReducer = combineReducers({ global, actors, packets });

// Exports from this module
exports.rootReducer = rootReducer;
});
