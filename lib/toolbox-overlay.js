/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const { components } = require("chrome");
const { Class } = require("sdk/core/heritage");
const simplePrefs = require("sdk/simple-prefs");
const { prefs } = simplePrefs;

// Firebug SDK
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);
/*const { Locale } = require("firebug.sdk/lib/core/locale.js");*/
const { ToolboxOverlay: ToolboxOverlayBase } = require("firebug.sdk/lib/toolbox-overlay.js");
const { TransportObserver } = require("./transport-observer.js");
const { Arr } = require("firebug.sdk/lib/core/array.js");
const { Options } = require("firebug.sdk/lib/core/options.js");

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

  packetCache: null,
  listeners: [],

  // Initialization

  initialize: function(options) {
    ToolboxOverlayBase.prototype.initialize.apply(this, arguments);

    Trace.sysout("ToolboxOverlay.initialize;", options);

    this.InspectorService = options.InspectorService;
    this.inspectorWindowName = options.inspectorWindowName;

    // handler of packetCache toggling
    this.onToggleCache = this.onToggleCache.bind(this);

    // set initial value
    this.onToggleCache();

    // register for prefs change
    simplePrefs.on("packetCacheEnabled", this.onToggleCache);

    // Transport Protocol
    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);

    // Initialize transport observer
    this.toolbox.target.makeRemote();
    let client = this.toolbox.target.client;
    this.transportObserver = new TransportObserver({client: client});
    this.transportObserver.addListener(this);

    // Number of removed packets from the cache that are out of limit.
    this.removedPackets = 0;
  },

  destroy: function() {
    ToolboxOverlayBase.prototype.destroy.apply(this, arguments);

    Trace.sysout("ToolboxOverlay.destroy;", arguments);

    simplePrefs.off("packetCacheEnabled", this.onToggleCache);

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

    Trace.sysout("ToolboxOverlay.onReady;", options);
  },

  onToggleCache: function() {
    this.packetCache = prefs.packetCacheEnabled ? [] : null;
  },

  // Transport Listener

  getPacketCache: function() {
    return {
      removedPackets: this.removedPackets,
      packets: this.packetCache
    };
  },

  addTransportListener: function(listener) {
    this.listeners.push(listener);

    // Stop caching as soon as the first listener is registered.
    // It's the {@InspectorWindow} object that is listening to
    // sent/received packets. The listener is added as soon as
    // the window is initialized.
    this.packetCache = null;
  },

  removeTransportListener: function(listener) {
    Arr.remove(this.listeners, listener);
  },

  onSendPacket: function(packet) {
    var data = {
      type: "send",
      packet: packet,
      time: (new Date()).getTime(),
      stack: this.getStack()
    };

    this.appendPacket(data);

    this.listeners.forEach(listener => {
      listener.onSendPacket(data);
    });
  },

  onReceivePacket: function(packet) {
    var data = {
      type: "receive",
      packet: packet,
      time: (new Date()).getTime(),
      stack: this.getStack()
    };

    this.appendPacket(data);

    this.listeners.forEach(listener => {
      listener.onReceivePacket(data);
    });
  },

  appendPacket: function(packet) {
    if (!this.packetCache) {
      return;
    }

    try {
      this.packetCache.push(packet);
    } catch (err) {
      Trace.sysout("ToolboxOverlay.appendPacket; ERROR" + err, err);

      // xxxHonza: create a new packet that displays an error in the
      // packet list UI.
      // this.packetCache.push({...});
      return;
    }

    var limit = Options.getPref("extensions.rdpinspector.packetCacheSize");
    while (this.packetCache.length > limit) {
      this.packetCache.shift();
      this.removedPackets++;
    }
  },

  getStack: function() {
    var frames = [];
    var stack = components.stack;
    while (stack) {
      frames.push({
        name: stack.name,
        lineNumber: stack.lineNumber,
        columnNumber: stack.columnNumber,
        fileName: stack.filename
      });
      stack = stack.asyncCaller || stack.caller;
    }
    return frames;
  },

  // Commands

  openInspectorWindow: function() {
    Trace.sysout("ToolboxOverlay.toggleInspector;");

    if (!this.inspector) {
      this.inspector = new InspectorWindow(this.InspectorService, this, this.inspectorWindowName);
    }

    // Show or hide the popup panel.
    this.inspector.open();

    return this.inspector;
  }
});

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
