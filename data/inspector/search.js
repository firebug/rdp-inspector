/* See license.txt for terms of usage */

define(function(require, exports, module) {

/**
 * TODO docs
 */
function Search(win, app) {
  this.win = win;
  this.app = app;
  this.win.addEventListener("search", this.onSearch.bind(this));
}

Search.prototype =
/** @lends Search */
{
  onSearch: function(event) {
    var value = JSON.parse(event.data);
    this.app.setState({searchFilter: value});
  },
}

// Exports from this module
exports.Search = Search;
});
