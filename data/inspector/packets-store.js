/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Constants
const refreshTimeout = 200;

/**
 * TODO docs
 */
function PacketsStore(win, app) {
  this.win = win;
  this.app = app;

  // List of all sent and received packets.
  this.packets = [];

  this.timeout = null;

  this.win.addEventListener("init-packet-list", this.onInitialize.bind(this));
  this.win.addEventListener("send-packet", this.onSendPacket.bind(this));
  this.win.addEventListener("receive-packet", this.onReceivePacket.bind(this));
}

PacketsStore.prototype =
/** @lends PacketsStore */
{
  onInitialize: function(event) {
    var packets = JSON.parse(event.data);

    for (var i=0; i<packets.length; i++) {
      var packet = packets[i];
      this.appendPacket({
        type: packet.type,
        packet: packet.packet,
        size: JSON.stringify(packet.packet).length,
        time: new Date(packet.time)
      });
    }

    if (!packets.length) {
      return;
    }
  },

  onSendPacket: function(event) {
    this.appendPacket({
      type: "send",
      packet: JSON.parse(event.data),
      size: event.data.length,
      time: new Date()
    });
  },

  onReceivePacket: function(event) {
    this.appendPacket({
      type: "receive",
      packet: JSON.parse(event.data),
      size: event.data.length,
      time: new Date()
    });
  },

  appendPacket: function(packet) {
    this.packets.push(packet);

    // xxxHonza: limit for now.
    if (this.packets.length > 500) {
      this.packets.shift();
    }

    this.refreshPackets(false);
  },

  refreshPackets: function(now) {
    if (this.timeout) {
      this.win.clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (now) {
      this.doRefreshPackets();
      return;
    }

    // Refresh on timeout to avoid to many re-renderings.
    this.timeout = this.win.setTimeout(() => {
      this.doRefreshPackets();
      this.timeout = null;
    }, refreshTimeout);
  },

  doRefreshPackets: function() {
    var newState = {
      data: this.packets
    }

    // Default selection
    if (!this.app.state.selectedPacket) {
      var selection = this.packets.length ? this.packets[0].packet : null;
      newState.selectedPacket = selection;
    }

    // If there are no packets clear the details side panel.
    if (!this.packets.length) {
      newState.selectedPacket = null;
    }

    this.app.setState(newState);
  },

  clear: function() {
    this.packets = [];
    this.refreshPackets(true);
  }
}

// Exports from this module
exports.PacketsStore = PacketsStore;
});
