/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "extermental"
};

// Firebug SDK
const { Dispatcher } = require("firebug.sdk/lib/dispatcher");
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale");
const { System } = require("firebug.sdk/lib/core/system");
const { TransportObserver } = require("./transport-observer.js");

// DevTools
const { ConnectionManager, Connection } = System.devtoolsRequire("devtools/client/connection-manager");

const ConnectionsMonitor =
/** @lends ConnectionsMonitor */
{
  // Initialization

  initialize: function() {
    console.log("INIT CONN MONITOR");
    Trace.sysout("ConnectionsMonitor.initialize;", arguments);

    this.onNewConnection = this.onNewConnection.bind(this);
    this.onDestroyConnection = this.onDestroyConnection.bind(this);

    this.transportObservers = new Map();
    this.transportListeners = new Map();

    ConnectionManager.on("new", this.onNewConnection);
    ConnectionManager.on("destroy", this.onDestroyConnection);
  },

  shutdown: function() {
    Trace.sysout("ConnectionsMonitor.shutdown;");

  },

  onNewConnection: function(type, connection) {
    console.log("NEW CONNECTION", connection, connection.client);
    connection.on(Connection.Events.CONNECTED, () => {
      console.log("CONNECTED", connection);
      let transportObserver = new TransportObserver({client: connection.client});
      let transportListener = {
        packetCache: [],
        onSendPacket: function(packet) {
          console.log("SEND PACKET", packet);
        },
        onReceivePacket: function(packet) {
          console.log("RECEIVE PACKET", packet);
        }
      };
      transportObserver.addListener(transportListener);
      this.transportObservers.set(connection, transportObserver);
      this.transportListeners.set(connection, transportListener);
    });
  },

  onDestroyConnection: function(type, connection) {
    console.log("DESTROY CONNECTION", connection);
    var listener = this.transportListeners.remove(connection);
    var observer = this.transportObservers.remove(connection);
    observer.removeListener(listener);
  }
};

// Registration
Dispatcher.register(ConnectionsMonitor);

// Exports from this module
exports.ConnectionsMonitor = ConnectionsMonitor;
