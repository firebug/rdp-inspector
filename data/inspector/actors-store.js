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

    this.actorIDs = this.collectActorIDs([
      data.tab.actorPool,
      data.tab.extraPools,
      data.global.actorPool,
      data.global.extraPools
    ], []);

    this.refreshActors();
  },

  clear: function() {
    this.actors = {};
  },

  collectActorIDs: function(data, res) {
    if (data instanceof Array) {
      data.forEach((item) => {
        this.collectActorIDs(item, res);
      })
    } else if (data instanceof Object) {
      if (data.pool) {
        this.collectActorIDs(data.pool, res);
      } else if (data.actorID) {
        var { actorID } = data
        if (res.indexOf(actorID) < 0) {
          res.push(actorID);
        }
      }
    }

    return res;
  },

  refreshActors: function() {
    this.app.setState({
      actors: this.actors,
      actorIDs: this.actorIDs
    })
  }
}

// Exports from this module
exports.ActorsStore = ActorsStore;
});
