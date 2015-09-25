/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "extermental"
};

const { prefs } = require("sdk/simple-prefs");

const { ToolboxOverlay } = require("./toolbox-overlay");

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

const WebIDEConnectionsMonitor =
/** @lends ConnectionsMonitor */
{
  // Initialization

  initialize: function() {
    Trace.sysout("WebIDEConnectionsMonitor.initialize;", arguments);

    this.onNewConnection = this.onNewConnection.bind(this);
    this.onDestroyConnection = this.onDestroyConnection.bind(this);

    this.toolboxOverlays = new Map();

    ConnectionManager.on("new", this.onNewConnection);
    ConnectionManager.on("destroy", this.onDestroyConnection);
  },

  shutdown: function() {
    Trace.sysout("WebIDEConnectionsMonitor.shutdown;");

  },

  onNewConnection: function(type, connection) {
    Trace.sysout("WebIDEConnectionsMonitor.onNewConnection;", arguments);

    connection.on(Connection.Events.CONNECTED, () => {
      if (prefs.webideConnectionsMonitor && AppManager.connection == connection) {
        let toolboxOverlay = new ToolboxOverlay({
          inspectorWindowName: AppManager.selectedRuntime.name,
          // fake webide toolbox
          toolbox: {
            target: {
              makeRemote: function() {},
              client: connection.client
            }
          }
        });
        this.toolboxOverlays.set(connection, toolboxOverlay);

        toolboxOverlay.toggleInspector();
      }
    });
  },

  onDestroyConnection: function(type, connection) {
    Trace.sysout("WebIDEConnectionsMonitor.onDestroyConnection;", arguments);

    if (this.toolboxOverlays.has(connection)) {
      let toolboxOverlay = this.toolboxOverlays.get(connection);
      this.toolboxOverlays.delete(connection);
      toolboxOverlay.destroy();
    }
  }
};

// Registration
Dispatcher.register(WebIDEConnectionsMonitor);

// Exports from this module
exports.WebIDEConnectionsMonitor = WebIDEConnectionsMonitor;
