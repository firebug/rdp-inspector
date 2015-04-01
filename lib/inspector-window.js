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
const windowType = "rdp-inspector";

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

    this.toolboxOverlay.transportListener.addListener(this);

    // Transport Protocol Handlers
    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);

    // Window Event Handlers
    this.onClose = this.onClose.bind(this);
    this.onLoad = this.onLoad.bind(this);

    this.onFrameContentLoaded = this.onFrameContentLoaded.bind(this);
  },

  destroy: function() {
    this.toolboxOverlay.transportListener.removeListener(this);

    if (this.win) {
      this.win.destroy();
    }
  },

  toggle: function() {
    let win = getMostRecentWindow(windowType);

    // If the Inspector is already opened, just reuse the window.
    if (win) {
      if ("initWithParams" in win) {
        win.initWithParams(params);
      }

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

    let frame = this.win.document.getElementById("contentFrame");
    frame.setAttribute("src", self.data.url("inspector/inspector.html"));

    Events.once(frame, "DOMContentLoaded", this.onFrameContentLoaded);
  },

  onFrameContentLoaded: function() {
    let contentWindow = this.getContentWindow();

    let { Trace: contentTrace } = FBTrace.get("CONTENT");
    Content.exportIntoContentScope(contentWindow, Str, "Str");
    Content.exportIntoContentScope(contentWindow, Locale, "Locale");
    Content.exportIntoContentScope(contentWindow, contentTrace, "Trace");
    Content.exportIntoContentScope(contentWindow, TraceError, "TraceError");
  },

  onClose: function(event) {
    Trace.sysout("InspectorWindow.onClose; " + event, arguments);

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

  postCommand: function(type, data) {
    let contentWindow = this.getContentWindow();
    if (!contentWindow) {
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
    if (!this.win) {
      return null;
    }

    let frame = this.win.document.getElementById("contentFrame");
    return frame && frame.contentWindow;
  }
});

// Exports from this module
exports.InspectorWindow = InspectorWindow;
