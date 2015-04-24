/* See license.txt for terms of usage */

define(function(require, exports, module) {

/**
 * This object contains all collected actors. It's also responsible
 * for refreshing the UI if new actors list is received.
 */
function ActorsStore(win, app) {
  this.win = win;
  this.app = app;

  this.onGotRDPActors = this.onGotRDPActors.bind(this);
  this.win.addEventListener("got-rdp-actors", this.onGotRDPActors);

  this.clear();
}

ActorsStore.prototype =
/** @lends ActorsStore */
{
  onGotRDPActors: function(event) {
    var data = JSON.parse(event.data);
    this.actors.tab = data.tab;
    this.actors.global = data.global;

    this.refreshActors();
  },

  clear: function() {
    this.actors = {};
  },

  refreshActors: function() {
    this.app.setState({
      actors: this.actors
    })
  }
}

// Exports from this module
exports.ActorsStore = ActorsStore;
});
