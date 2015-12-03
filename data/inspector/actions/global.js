/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const types = {
  SET_SEARCH_FILTER: "SET_SEARCH_FILTER",
};

// export actions types and action creators
module.exports = {
  types,

  setSearchFilter(filter) {
    return { type: types.SET_SEARCH_FILTER, filter };
  },
};

});
