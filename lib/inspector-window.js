/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const self = require("sdk/self");
const options = require("@loader/options");
const { Cu, Ci, Cc } = require("chrome");
const { Class } = require("sdk/core/heritage");
const { getMostRecentWindow } = require("sdk/window/utils");
const { openDialog } = require("sdk/window/utils");
const Events = require("sdk/dom/events");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { Str } = require("firebug.sdk/lib/core/string.js");

// Constants
const windowType = "RDPInspectorConsole";

/**
 * xxxHonza: TODO docs
 */
const InspectorWindow = Class(
/** @lends InspectorWindow */
{
  // Initialization

  initialize: function(toolboxOverlay) {
    this.toolboxOverlay = toolboxOverlay;
    this.toolbox = toolboxOverlay.toolbox;

    // Transport Protocol
    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);

    // DOM Events
    this.onClose = this.onClose.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onFrameContentLoaded = this.onFrameContentLoaded.bind(this);

    // Message Manager
    this.onContentMessage = this.onContentMessage.bind(this);
  },

  destroy: function() {
    this.toolboxOverlay.transportListener.removeListener(this);

    if (this.win) {
      this.win.destroy();
    }
  },

  toggle: function() {
    Trace.sysout("InspectorWindow.toggle;", arguments);

    let win = getMostRecentWindow(windowType);

    // If the Inspector is already opened, just reuse the window.
    if (win) {
      win.focus();
      return win;
    }

    let url = "chrome://rdpinspector/content/inspector-window.xul";
    return this.open("rdp-inspector", url);
  },

  open: function(windowType, url, params) {
    Trace.sysout("InspectorWindow.open;", arguments);

    // Open RDP Inspector console window. The
    this.win = openDialog({
      url: url,
      name: Locale.$STR("rdpInspector.startButton.title"),
      args: params,
      features: "chrome,resizable,scrollbars=auto,minimizable,dialog=no"
    });

    // Hook events
    Events.on(this.win, "load", this.onLoad);
    Events.on(this.win, "close", this.onClose);

    return this.win;
  },

  // Console Events

  onLoad: function(event) {
    Trace.sysout("InspectorWindow.onLoad; ", event);

    let frame = this.getFrame();
    frame.setAttribute("src", self.data.url("inspector/main.html"));

    // Load content script and handle messages sent from it.
    let { messageManager } = frame.frameLoader;
    if (messageManager) {
      let url = self.data.url("inspector/frame-script.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }

    Events.once(frame, "DOMContentLoaded", this.onFrameContentLoaded);
  },

  onFrameContentLoaded: function(event) {
    Trace.sysout("InspectorWindow.onFrameContentLoaded; ", event);

    let contentWindow = this.getContentWindow();

    let { Trace: contentTrace } = FBTrace.get("CONTENT");
    Content.exportIntoContentScope(contentWindow, Str, "Str");
    Content.exportIntoContentScope(contentWindow, Locale, "Locale");
    Content.exportIntoContentScope(contentWindow, contentTrace, "Trace");
    Content.exportIntoContentScope(contentWindow, TraceError, "TraceError");
  },

  onWindowInitialized: function(event) {
    Trace.sysout("InspectorWindow.onFrameLoad; ", event);

    // Get cache before registering the listener.
    let packetCache = this.toolboxOverlay.getPacketCache();

    // Start listening to RDP traffic.
    this.toolboxOverlay.addTransportListener(this);

    // Make sure packets sent at the very beginning are also displayed.
    if (packetCache) {
      this.postCommand("init-packet-list", JSON.stringify(packetCache));
    }
  },

  onInjectRDPPacket: function(packet) {
    this.toolbox.target.client._transport.send(packet);
  },

  onClose: function(event) {
    Trace.sysout("InspectorWindow.onClose; " + event, arguments);

    this.toolboxOverlay.removeTransportListener(this);

    this.win = null;
  },

  // Transport Listener

  onSendPacket: function(packet) {
    this.postCommand("send-packet", JSON.stringify(packet));
  },

  onReceivePacket: function(packet) {
    this.postCommand("receive-packet", JSON.stringify(packet));
  },

  // Content <-> Chrome Communication

  /**
   * Handle messages coming from the content scope (from panel's iframe).
   */
  onContentMessage: function(msg) {
    Trace.sysout("InspectorWindow.onContentMessage; " + msg.data.type, msg);

    let result;
    let event = msg.data;

    switch (event.type) {
    case "injectRDPPacket":
      this.onInjectRDPPacket(event.args);
      break;
    case "find":
      this.win.gFindBar.onFindCommand();
      break;

    case "initialized":
      this.onWindowInitialized();
      break;
    }
  },

  postContentMessage: function(id, data) {
    let frame = this.getFrame();
    let { messageManager } = frame.frameLoader;
    messageManager.sendAsyncMessage("rdpinspector/event/message", {
      type: id,
      bubbles: false,
      cancelable: false,
      data: data,
      origin: this.url,
    });
  },

  postCommand: function(type, data) {
    let contentWindow = this.getContentWindow();
    if (!contentWindow) {
      TraceError.sysout("InspectorWindow.postCommand; ERROR no window for: " +
        type, data);
      return;
    }

    var event = new contentWindow.MessageEvent(type, {
      bubbles: true,
      cancelable: true,
      data: data,
    });

    contentWindow.dispatchEvent(event);
  },

  getContentWindow: function() {
    let frame = this.getFrame();
    if (!frame) {
      return null;
    }

    return frame && frame.contentWindow;
  },

  getFrame: function() {
    if (!this.win) {
      return null;
    }

    return this.win.document.getElementById("contentFrame");
  }
});

// Exports from this module
exports.InspectorWindow = InspectorWindow;
