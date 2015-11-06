/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const actors = require("./actors");
const packets = require("./packets");

module.exports = Object.assign({}, actors, packets, {
  types: Object.assign({}, actors.types, packets.types)
});

});
