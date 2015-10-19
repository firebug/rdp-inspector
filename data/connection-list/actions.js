/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const types = {
  SET_CONNECTIONS: "SET_CONNECTIONS"
};

// export actions types and action creators
module.exports = {
  types,

  setConnections(connections) {
    return { type: types.SET_CONNECTIONS, connections };
  }
};

});
