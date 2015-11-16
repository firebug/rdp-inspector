/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const global = require("./global");
const actors = require("./actors");
const packets = require("./packets");

module.exports = Object.assign({}, global, actors, packets, {
  types: Object.assign({}, actors.types, packets.types)
});

});
