/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "extermental"
};

const { prefs } = require("sdk/simple-prefs");

// Firebug SDK
const { Dispatcher } = require("firebug.sdk/lib/dispatcher");
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);

// DevTools
// See also: https://bugzilla.mozilla.org/show_bug.cgi?id=912121
const { devtools, safeRequire } = require("firebug.sdk/lib/core/devtools");
const {
  ConnectionManager, Connection
} = safeRequire(devtools, "devtools/client/connection-manager", "devtools/shared/client/connection-manager");
const {
  AppManager
} = safeRequire(devtools, "devtools/webide/app-manager", "devtools/client/webide/modules/app-manager");

/**
 * @service This service monitors the connections created by WebIDE and dispatch the
 * webide connection lifecycle events, which are used by the InspectorService to keep
 * track of the existent debugger clients (and their related toolboxes).
 */
const WebIDEConnectionsMonitor =
/** @lends WebIDEConnectionsMonitor */
{
  // Initialization

  initialize: function() {
    Trace.sysout("WebIDEConnectionsMonitor.initialize;", arguments);

    this.onNewConnection = this.onNewConnection.bind(this);
    this.onDestroyConnection = this.onDestroyConnection.bind(this);

    ConnectionManager.on("new", this.onNewConnection);
    ConnectionManager.on("destroy", this.onDestroyConnection);
  },

  shutdown: function() {
    Trace.sysout("WebIDEConnectionsMonitor.shutdown;");

  },

  onNewConnection: function(type, connection) {
    Trace.sysout("WebIDEConnectionsMonitor.onNewConnection;", arguments);

    Dispatcher.emit("onWebIDEConnectionCreated", [{ connection }]);

    connection.on(Connection.Events.CONNECTED, () => {
      if (prefs.webideConnectionsMonitor && AppManager.connection == connection) {

        Dispatcher.emit("onWebIDEConnectionReady", [{ connection, selectedRuntime: AppManager.selectedRuntime }]);
      }
    });
  },

  onDestroyConnection: function(type, connection) {
    Trace.sysout("WebIDEConnectionsMonitor.onDestroyConnection;", arguments);

    Dispatcher.emit("onWebIDEConnectionDestroy", [ { connection } ]);
  }
};

// Registration
Dispatcher.register(WebIDEConnectionsMonitor);

// Exports from this module
exports.WebIDEConnectionsMonitor = WebIDEConnectionsMonitor;
