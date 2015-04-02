/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Constants
const refreshTimeout = 200;

/**
 * TODO docs
 */
function PacketStore(win, app) {
  this.win = win;
  this.app = app;

  // List of all sent and received packets.
  this.packets = [];

  this.timeout = null;

  this.win.addEventListener("init-packet-list", this.onInitialize.bind(this));
  this.win.addEventListener("send-packet", this.onSendPacket.bind(this));
  this.win.addEventListener("receive-packet", this.onReceivePacket.bind(this));
}

PacketStore.prototype =
/** @lends PacketStore */
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

    this.refreshPackets();
  },

  refreshPackets: function() {
    if (this.timeout) {
      this.win.clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Refresh on timeout to avoid to many re-renderings.
    this.timeout = this.win.setTimeout(() => {
      var newState = {
        data: this.packets
      }

      // Default selection
      if (!this.app.state.selectedPacket) {
        newState.selectedPacket = this.packets[0].packet;
      }

      this.app.setState(newState);
      this.timeout = null;
    }, refreshTimeout);
  },
}

// Exports from this module
exports.PacketStore = PacketStore;
});
