/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Constants
const refreshTimeout = 200;

/**
 * This object contains all collected packets. It's also responsible
 * for refreshing the UI if new packets appears.
 */
function PacketsStore(win, app) {
  this.win = win;
  this.app = app;

  this.win.addEventListener("init-packet-list", this.onInitialize.bind(this));
  this.win.addEventListener("send-packet", this.onSendPacket.bind(this));
  this.win.addEventListener("receive-packet", this.onReceivePacket.bind(this));

  this.clear();
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

    // Default summary info appended into the list.
    this.appendSummary();
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

  appendPacket: function(packet, now) {
    this.packets.push(packet);

    packet.id = ++this.uniqueId;

    // Collect statistics data.
    if (packet.type == "send") {
      this.summary.data.sent += packet.size;
      this.summary.packets.sent += 1;
    } else if (packet.type == "receive") {
      this.summary.data.received += packet.size;
      this.summary.packets.received += 1;
    }

    var limit = Options.getPref("extensions.rdpinspector.packetLimit");
    if (this.packets.length > limit) {
      this.packets.shift();
      this.removedPackets++;
    }

    this.refreshPackets(now);
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
      packets: this.packets,
      removedPackets: this.removedPackets
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
    this.uniqueId = 0;

    // Number of removed packets that are out of limit.
    this.removedPackets = 0;

    this.summary = {
      data: {
        sent: 0,
        received: 0
      },
      packets: {
        sent: 0,
        received: 0,
      }
    };

    this.refreshPackets(true);
  },

  appendSummary: function() {
    this.appendPacket({
      type: "summary",
      time: new Date(),
      data: {
        sent: this.summary.data.sent,
        received: this.summary.data.received
      },
      packets: {
        sent: this.summary.packets.sent,
        received: this.summary.packets.received
      }
    }, true);
  },

  appendMessage: function(message) {
    this.appendPacket({
      type: "message",
      time: new Date(),
      message: message
    }, true);
  }
}

// Exports from this module
exports.PacketsStore = PacketsStore;
});
