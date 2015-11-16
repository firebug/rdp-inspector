/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

const actions = require("./actions/index");

/**
 * This object is responsible for listening search events
 * and updating application state (the root RJS component).
 */
function Search(win, store) {
  this.win = win;
  this.store = store;

  this.win.addEventListener("search", this.onSearch.bind(this));
}

Search.prototype =
/** @lends Search */
{
  onSearch: function(event) {
    var value = event.data;
    this.store.dispatch(actions.setSearchFilter(value));
  }
};

// Exports from this module
exports.Search = Search;
});
