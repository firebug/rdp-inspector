/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Constants
/**
 * This object contains all collected actors. It's also responsible
 * for refreshing the UI if new actors appears.
 */
function ActorsStore(win, app) {
  this.win = win;
  this.app = app;

  this.win.addEventListener("got-rdp-actors", this.onGotRDPActors.bind(this));

  this.clear();
}

ActorsStore.prototype =
/** @lends ActorsStore */
{
  onGotRDPActors: function(event) {
    console.log("DATA: GOT RDP ACTORS", event);
    var actors = JSON.parse(event.data);
  },


  clear: function() {
    this.actors = {};
    this.factoris = {};
  },
}

// Exports from this module
exports.ActorsStore = ActorsStore;
});
