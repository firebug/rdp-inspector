/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const types = {
  SET_ACTORS: "SET_ACTORS",
  CLEAR_ACTORS: "CLEAR_ACTORS"
};

// export actions types and action creators
module.exports = {
  types,

  setActors(actors) {
    return { type: types.SET_ACTORS, actors };
  },

  clearActors() {
    return { type: types.CLEAR_ACTORS };
  },
};

});
