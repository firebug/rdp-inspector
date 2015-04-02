/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const options = require("@loader/options");
const { Cu, Ci } = require("chrome");
const { Class } = require("sdk/core/heritage");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { ToolboxOverlay: ToolboxOverlayBase } = require("firebug.sdk/lib/toolbox-overlay.js");
const { TransportListener } = require("./transport-listener.js");
const { Arr } = require("firebug.sdk/lib/core/array.js");

// RDP Inspector
const { InspectorWindow } = require("./inspector-window.js");

/**
 * @overlay xxxHonza: TODO docs
 */
const ToolboxOverlay = Class(
/** @lends ToolboxOverlay */
{
  extends: ToolboxOverlayBase,

  overlayId: "RdpInspectorToolboxOverlay",

  packetCache: [],
  listeners: [],

  // Initialization

  initialize: function(options) {
    ToolboxOverlayBase.prototype.initialize.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.initialize;", options);

    // Transport Protocol
    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);

    // Initialize transport observer
    let remotePromise = this.toolbox.target.makeRemote();
    let client = this.toolbox.target.client;
    this.transportObserver = new TransportListener({client: client});
    this.transportObserver.addListener(this);
  },

  destroy: function() {
    ToolboxOverlayBase.prototype.destroy.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.destroy;", arguments);

    if (this.transportObserver) {
      this.removeTransportListener(this);
      this.transportObserver.destroy();
    }

    if (this.inspector) {
      this.inspector.destroy();
    }
  },

  // Events

  onReady: function(options) {
    ToolboxOverlayBase.prototype.onReady.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.onReady;", options);
  },

  // Transport Listener

  getPacketCache: function() {
    return this.packetCache;
  },

  addTransportListener: function(listener) {
    this.listeners.push(listener);

    // Stop caching as soon as the first listener is registered
    this.packetCache = null;
  },

  removeTransportListener: function(listener) {
    Arr.remove(this.listeners, listener);
  },

  onSendPacket: function(packet) {
    this.appendPacket({
      type: "send",
      packet: packet,
      time: new Date()
    });

    this.listeners.forEach(listener => {
      listener.onSendPacket(packet);
    });
  },

  onReceivePacket: function(packet) {
    this.appendPacket({
      type: "receive",
      packet: packet,
      time: new Date()
    });

    this.listeners.forEach(listener => {
      listener.onReceivePacket(packet);
    });
  },

  appendPacket: function(packet) {
    if (!this.packetCache) {
      return;
    }

    this.packetCache.push(packet);

    // xxxHonza: limit for now. Should be a preference.
    if (this.packetCache.length > 200) {
      this.packetCache.shift();
    }
  },

  // Commands

  toggleInspector: function() {
    Trace.sysout("ToolboxOverlayBase.toggleInspector;");

    if (!this.inspector) {
      this.inspector = new InspectorWindow(this);
    }

    // Show or hide the popup panel.
    this.inspector.toggle();

    return this.inspector;
  },
});

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
