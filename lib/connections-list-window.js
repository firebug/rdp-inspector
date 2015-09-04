/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Add-on SDK
const self = require("sdk/self");
/*const options = require("@loader/options");*/
const { Class } = require("sdk/core/heritage");
const { openDialog, getMostRecentWindow } = require("sdk/window/utils");
const Events = require("sdk/dom/events");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { Str } = require("firebug.sdk/lib/core/string.js");
const { Options } = require("firebug.sdk/lib/core/options.js");

// Constants
const { InspectorService } = require("./inspector-service.js");

const WINDOW_TYPE = "RDPInspectorConnectionsList";
const CONNECTIONS_XUL_URL = "chrome://rdpinspector/content/connections-window.xul";

/**
 * This class manages the connections list window
 */
const ConnectionsListWindow = Class(
/** @lends ConnectionsListWindow */
{
  initialize() {
    // TODO: bind event handling methods

    // DOM Events
    this.onClose = this.onClose.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onFrameContentLoaded = this.onFrameContentLoaded.bind(this);

    // Message Manager
    this.onContentMessage = this.onContentMessage.bind(this);
  },

  destroy() {
    // TODO: cleanup (e.g. close the connection list window)
  },

  open() {
    Trace.sysout("ConnectionsListWindow.open;", arguments);

    // If the Connections List window is already opened, focus and return it.
    let win = getMostRecentWindow(WINDOW_TYPE);

    if (win) {
      win.focus();
      return win;
    }

    return this._open("rdp-inspector-connections", CONNECTIONS_XUL_URL, [{}]);
  },

  _open(windowType, url, params) {
    Trace.sysout("ConnectionsListWindow.open;", arguments);

    // Open RDP Inspector console window.
    this.win = openDialog({
      url: url,
      name: WINDOW_TYPE,
      args: params,
      features: "chrome,resizable,scrollbars=auto,minimizable,dialog=no"
    });

    // Hook events
    Events.on(this.win, "load", this.onLoad);
    Events.on(this.win, "close", this.onClose);

    return this.win;
  },

  // Event Handlers

  onLoad(event) {
    Trace.sysout("ConnectionsListWindow.onLoad; ", event);

    let frame = this.getFrame();
    frame.setAttribute("src", self.data.url("connections-list/index.html"));

    // Load content script and handle messages sent from it.
    let { messageManager } = frame.frameLoader;
    if (messageManager) {
      let url = self.data.url("inspector/frame-script.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }

    Events.once(frame, "DOMContentLoaded", this.onFrameContentLoaded);
  },

  onFrameContentLoaded(event) {
    Trace.sysout("ConnectionsListWindow.onFrameContentLoaded; ", event);

    let contentWindow = this.getContentWindow();

    let { Trace: contentTrace } = FBTrace.get("CONTENT");
    Content.exportIntoContentScope(contentWindow, Str, "Str");
    Content.exportIntoContentScope(contentWindow, Locale, "Locale");
    Content.exportIntoContentScope(contentWindow, contentTrace, "Trace");
    Content.exportIntoContentScope(contentWindow, TraceError, "TraceError");
    Content.exportIntoContentScope(contentWindow, Options, "Options");
  },

  onClose(event) {
    Trace.sysout("ConnectionsListWindow.onClose; " + event, arguments);

    this.win = null;
  },

  // Content <-> Chrome Communication

  /**
   * Handle messages coming from the content scope (from panel's iframe).
   */
  onContentMessage: function(msg) {
    Trace.sysout("InspectorWindow.onContentMessage; " + msg.data.type, msg);

    let event = msg.data;
    let args = event.args;

    switch (event.type) {
    case "inject-rdp-packet":
      this.onInjectRDPPacket(args);
      break;

    case "get-rdp-actors":
      this.onGetRDPActors();
      break;

    case "find":
      this.win.gFindBar.onFindCommand();
      break;

    case "initialized":
      this.onWindowInitialized();
      break;

    case "pause":
      this.onPause(args);
      break;

    case "load-from-file":
      this.onLoadFromFile(args);
      break;

    case "save-to-file":
      this.onSaveToFile(args);
      break;

    case "options-toggle":
      this.onOptionsToggle(args);
      break;

    case "view-source":
      this.onViewSource(args);
      break;
    }
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
      data: data
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
exports.ConnectionsListWindow = ConnectionsListWindow;
