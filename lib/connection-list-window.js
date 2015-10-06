/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Add-on SDK
const { data } = require("sdk/self");
/*const options = require("@loader/options");*/
const { Class } = require("sdk/core/heritage");
const { openDialog, getMostRecentWindow } = require("sdk/window/utils");
const Events = require("sdk/dom/events");
const { Cu } = require("chrome");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { Str } = require("firebug.sdk/lib/core/string.js");
const { Options } = require("firebug.sdk/lib/core/options.js");
const { Dispatcher } = require("firebug.sdk/lib/dispatcher.js");

// Constants
const { InspectorService } = require("./inspector-service.js");

const WINDOW_TYPE = "RDPInspectorConnectionList";
const CONNECTIONS_XUL_URL = "chrome://rdpinspector/content/connections-window.xul";

/**
 * This class manages the connections list window
 */
const ConnectionListWindow = Class(
/** @lends ConnectionListWindow */
{
  initialize() {
    // TODO: bind event handling methods

    // DOM Events
    this.onClose = this.onClose.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onFrameContentLoaded = this.onFrameContentLoaded.bind(this);

    // Content  callbacks
    this.connectionsUpdatedListeners = new Set();

    // Dispatcher events
    this.onRDPConnectionsUpdated = this.onRDPConnectionsUpdated.bind(this);

    Dispatcher.on("onRDPConnectionsUpdated", this.onRDPConnectionsUpdated);
  },

  destroy() {
    // TODO: cleanup (e.g. close the connection list window)

    // Content  callbacks
    this.connectionsUpdatedListeners.clear();

    // Dispatcher events
    Dispatcher.off("onRDPConnectionsUpdated", this.onRDPConnectionsUpdated);
  },

  open() {
    Trace.sysout("ConnectionListWindow.open;", arguments);

    // If the Connections List window is already opened, focus and return it.
    let win = getMostRecentWindow(WINDOW_TYPE);

    if (win) {
      win.focus();
      return win;
    }

    return this._open("rdp-inspector-connections", CONNECTIONS_XUL_URL, [{}]);
  },

  _open(windowType, url, params) {
    Trace.sysout("ConnectionListWindow.open;", arguments);

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
    Trace.sysout("ConnectionListWindow.onLoad; ", event);

    let frame = this.getFrame();
    frame.setAttribute("src", data.url("connection-list/index.html"));

    Events.once(frame, "DOMContentLoaded", this.onFrameContentLoaded);
  },

  onFrameContentLoaded(event) {
    Trace.sysout("ConnectionListWindow.onFrameContentLoaded; ", event);

    let contentWindow = this.getContentWindow();

    let { Trace: contentTrace } = FBTrace.get("CONTENT");
    Content.exportIntoContentScope(contentWindow, Str, "Str");
    Content.exportIntoContentScope(contentWindow, Locale, "Locale");
    Content.exportIntoContentScope(contentWindow, contentTrace, "Trace");
    Content.exportIntoContentScope(contentWindow, TraceError, "TraceError");
    Content.exportIntoContentScope(contentWindow, Options, "Options");

    this.exportCustomContentAPI(contentWindow);
  },

  exportCustomContentAPI(contentWindow) {
    var contentAPI = Cu.createObjectIn(contentWindow, {
      defineAs: "RDPConnectionList"
    });

    Cu.exportFunction(function getConnectionsInfo() {
      let connectionsInfo = InspectorService.getConnectionsInfo();

      return Cu.cloneInto(connectionsInfo, contentWindow);
    }, contentAPI, {
      defineAs: "getConnectionsInfo"
    });

    Cu.exportFunction(function openRDPInspectorWindow(conn) {
      InspectorService.openRDPInspectorWindow(conn.uuid);
    }, contentAPI, {
      defineAs: "openRDPInspectorWindow"
    });

    var onConnectionsUpdated = Cu.createObjectIn(contentAPI, {
      defineAs: "onConnectionsUpdated"
    });

    Cu.exportFunction((cb) => {
      this.connectionsUpdatedListeners.add(cb);
    }, onConnectionsUpdated, { allowCallbacks: true, defineAs: "addListener" });

    Cu.exportFunction((cb) => {
      this.connectionsUpdatedListeners.delete(cb);
    }, onConnectionsUpdated, { allowCallbacks: true, defineAs: "removeListener" });
  },

  onRDPConnectionsUpdated() {
    let contentWindow = this.getContentWindow();
    let connectionsInfo = InspectorService.getConnectionsInfo();

    let contentConnInfo = Cu.cloneInto(connectionsInfo, contentWindow);

    for (let cb of this.connectionsUpdatedListeners) {
      try {
        cb(contentConnInfo);
      } catch(e) {
        TraceError.sysout("ConnectionListWindow.onRDPConnectionsUpdated; ERROR in content cb: " + e);
      }
    }
  },

  onClose(event) {
    Trace.sysout("ConnectionListWindow.onClose; " + event, arguments);

    this.win = null;
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
exports.ConnectionListWindow = ConnectionListWindow;
