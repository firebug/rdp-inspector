/* See license.txt for terms of usage */
/* globals Options */

define(function(require, exports/*, module*/) {

"use strict";

// Constants
const refreshTimeout = 200;

/**
 * This object contains all collected packets. It's also responsible
 * for refreshing the UI if new packets appears.
 */
function PacketsStore(win, app) {
  this.win = win;
  this.app = app;

  this.win.addEventListener("init-options", this.onInitOptions.bind(this));
  this.win.addEventListener("init-packet-list", this.onInitialize.bind(this));
  this.win.addEventListener("send-packet", this.onSendPacket.bind(this));
  this.win.addEventListener("receive-packet", this.onReceivePacket.bind(this));
  this.win.addEventListener("loaded-packet-list-file", this.onLoadedPacketListFile.bind(this));

  this.clear();
}

const DUMP_FORMAT_VERSION = "rdp-inspector/packets-store/v1";
const DUMP_FORMAT_KEYS = [
  "packets", "summary",
  "uniqueId", "removedPackets"
];

PacketsStore.prototype =
/** @lends PacketsStore */
{
  onLoadedPacketListFile: function(event) {
    try {
      this.deserialize(event.data);
    } catch(e) {
      this.app.setState({
        error: {
          message: "Error loading packets from file",
          details: e
        }
      });
    }
  },

  onInitialize: function(event) {
    var cache = JSON.parse(event.data);

    // Get number of packets removed from the cache.
    this.removedPackets = cache.removedPackets || 0;

    // Get list of cached packets and render if any.
    var packets = cache.packets;
    if (!packets || !packets.length) {
      return;
    }

    for (var i = 0; i < packets.length; i++) {
      var packet = packets[i];
      var packetString = JSON.stringify(packet.packet);

      this.appendPacket({
        type: packet.type,
        rawPacket: packetString,
        packet: packet.packet,
        size: packetString.length,
        time: new Date(packet.time),
        stack: new StackTrace(packet.stack, packet.type)
      });
    }

    // Default summary info appended into the list.
    this.appendSummary();
  },

  onInitOptions: function(event) {
    var { showInlineDetails, packetCacheEnabled } = JSON.parse(event.data);

    this.app.setState({
      showInlineDetails: showInlineDetails,
      packetCacheEnabled: packetCacheEnabled
    });
  },

  onSendPacket: function(event) {
    var data = JSON.parse(event.data);
    var packetString = JSON.stringify(data.packet);

    this.appendPacket({
      type: "send",
      rawPacket: packetString,
      packet: data.packet,
      size: packetString.length,
      time: new Date(data.time),
      stack: new StackTrace(data.stack, "send")
    });
  },

  onReceivePacket: function(event) {
    var data = JSON.parse(event.data);
    var packetString = JSON.stringify(data.packet);

    this.appendPacket({
      type: "receive",
      rawPacket: packetString,
      packet: data.packet,
      size: packetString.length,
      time: new Date(data.time),
      stack: new StackTrace(data.stack, "receive")
    });
  },

  appendPacket: function(packet, now) {
    this.packets.push(packet);

    packet.id = ++this.uniqueId;

    // Collect statistics data.
    if (packet.type === "send") {
      this.summary.data.sent += packet.size;
      this.summary.packets.sent += 1;
    } else if (packet.type === "receive") {
      this.summary.data.received += packet.size;
      this.summary.packets.received += 1;
    }

    var limit = Options.getPref("extensions.rdpinspector.packetLimit");
    while (this.packets.length > limit) {
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
    var packets = this.doFilterPacketsList(this.packets);

    var newState = {
      packets: packets,
      removedPackets: this.removedPackets
    };

    // Default selection
    if (!this.app.state.selectedPacket) {
      var selection = packets.length ? packets[0] : null;
      newState.selectedPacket = selection;
    }

    // If there are no packets clear the details side panel.
    if (!packets.length) {
      newState.selectedPacket = null;
    }

    this.app.setState(newState);
  },

  doFilterPacketsList: function() {
    var filterFrom = {};

    return this.packets.filter((packet) => {
      var actorId = packet.packet ? (packet.packet.to || packet.packet.from) : null;

      // filter our all the RDPi actorInspector actor
      if (actorId && actorId.indexOf("actorInspector") > 0) {
        return false;
      }

      if (packet.type == "send") {
        // filter sent RDP packets needed to register the RDPi actorInspector actor
        if (packet.packet.rdpInspectorInternals) {
          filterFrom[packet.packet.to] = filterFrom[packet.packet.to] || 0;
          filterFrom[packet.packet.to] += 1;

          return false;
        }

        // filter sent RDP packets needed to register the RDPi actorInspector actor
        if (packet.packet.type == "registerActor" &&
            packet.packet.filename.indexOf("rdpinspector-at-getfirebug-dot-com") > 0) {
          filterFrom[packet.packet.to] = filterFrom[packet.packet.to] || 0;
          filterFrom[packet.packet.to] += 1;
          return false;
        }
      }

      // filter received RDP packets needed to register the RDPi actorInspector actor
      if (packet.type == "receive" && filterFrom[packet.packet.from] > 0) {
        filterFrom[packet.packet.from] -= 1;
        return false;
      }

      return true;
    });
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
        received: 0
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
  },

  serialize: function() {
    var data = {
      "!format!": DUMP_FORMAT_VERSION
    };
    DUMP_FORMAT_KEYS.forEach((key) => {
      data[key] = this[key];
    });
    return JSON.stringify(data);
  },

  deserialize: function(rawdata) {
    var data = JSON.parse(rawdata, (k, v) => {
      switch (k) {
      case "time":
        return new Date(v);
      default:
        return v;
      }
    });

    if (data["!format!"] &&
        data["!format!"] === DUMP_FORMAT_VERSION) {
      DUMP_FORMAT_KEYS.forEach((key) => {
        this[key] = data[key];
      });
    } else {
      throw Error("Dump file format unrecognized");
    }

    this.refreshPackets(true);
  }
};

// StackTrace

// xxxHonza: revisit frame filtering should and find solid way.
function StackTrace(frames, packetType) {
  // Remove all frames before 'EventEmitter_emit()' frame.
  // These are part of the infrastructure (always there).
  if (packetType == "send") {
    //frames = filterFrames(frames, "DebuggerClient.requester/<");
    //frames = filterFrames(frames, "EventEmitter_emit");
    //frames = filterFrames(frames, "makeInfallible/<", true);
  }

  // Filter out empty frames
  frames = frames.filter(frame => !!frame.name);

  // Create StackFrame instances, so the right rep is used for
  // rendering (see {@StackFrameRep}.
  this.frames = frames.map(frame => new StackFrame(frame));
}

StackTrace.prototype = {
  hasFrames: function() {
    return this.frames.length > 0;
  },

  getTopFrame: function() {
    return this.hasFrames() ? this.frames[0] : null;
  },
};

// StackFrame

function StackFrame(frame) {
  this.url = frame.fileName;
  this.lineNumber = frame.lineNumber;
  this.columnNumber = frame.columnNumber;
  this.name = frame.name;
}

StackFrame.prototype = {
  getLabel: function() {
    var path = this.url;
    var index = path ? path.lastIndexOf("/") : -1;
    var label = (index == -1) ? path : path.substr(index + 1);

    if (this.lineNumber) {
      label += ":" + this.lineNumber;
    }

    if (this.columnNumber) {
      label += ":" + this.columnNumber;
    }

    return label;
  },

  getUrl: function() {
    return this.url;
  }
};

// Helpers

/* NOTE: currently unused */
/*
function filterFrames(frames, pivot, onlyFirst) {
  var frame;

  if (onlyFirst) {
    for (frame of frames) {
      if (frame.name == pivot) {
        frames.shift();
      } else {
        break;
      }
    }
    return frames;
  }

  var newFrames = [];
  var remove = true;
  for (frame of frames) {
    if (!remove) {
      newFrames.push(frame);
    }

    if (frame.name == pivot) {
      remove = false;
    }
  }

  // The pivot frame wasn't found.
  if (remove) {
    newFrames = frames;
  }

  return newFrames;
}
*/

// Exports from this module
exports.PacketsStore = PacketsStore;
exports.StackTrace = StackTrace;
exports.StackFrame = StackFrame;
});
