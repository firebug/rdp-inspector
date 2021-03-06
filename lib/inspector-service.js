/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Add-on SDK
const options = require("@loader/options");
const { Cu } = require("chrome");
const { defer, all } = require("sdk/core/promise");

const { uuid } = require("sdk/util/uuid");
const { prefs } = require("sdk/simple-prefs");

// Firebug SDK
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Dispatcher } = require("firebug.sdk/lib/dispatcher");
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Rdp } = require("firebug.sdk/lib/core/rdp.js");

// DevTools
// See also: https://bugzilla.mozilla.org/show_bug.cgi?id=912121
const { devtools, gDevTools } = require("firebug.sdk/lib/core/devtools.js");

var DebuggerClient;
try {
  DebuggerClient = devtools["require"]("devtools/shared/client/main").DebuggerClient;
} catch(e) {
  DebuggerClient = Cu.import("resource://gre/modules/devtools/dbg-client.jsm", {}).DebuggerClient;
}
const { on, off } = devtools["require"]("sdk/event/core");

// RDP Inspector
const { InspectorFront } = require("./inspector-front.js");

// URL of the {@InspectorActor} module. This module will be
// installed and loaded on the backend.
const actorModuleUrl = options.prefixURI + "lib/inspector-actor.js";

/**
 * @service This object represents 'RDP Inspector Service'.
 * This service is responsible for registering necessary back-end
 * actors and loading related UI (panels).
 *
 * This object is a singleton and there is only one instance created.
 */
const InspectorService =
/** @lends InspectorService */
{
  // Initialization

  initialize: function() {
    Trace.sysout("InspectorService.initialize;", arguments);

    // keeps track of connections and their relared targets/toolboxes/webide connections
    this.clientsMap = new Map();
    this.clientsByUUID = new Map();

    this.onDebuggerClientConnect = this.onDebuggerClientConnect.bind(this);
    this.onDebuggerClientClosed = this.onDebuggerClientClosed.bind(this);
    this.onToolboxReady = this.onToolboxReady.bind(this);
    this.onToolboxDestroy = this.onToolboxDestroy.bind(this);
    this.onToolboxOverlay = this.onToolboxOverlay.bind(this);

    this.onWebIDEConnectionCreated = this.onWebIDEConnectionCreated.bind(this);
    this.onWebIDEConnectionReady = this.onWebIDEConnectionReady.bind(this);

    on(DebuggerClient, "connect", this.onDebuggerClientConnect);
  },

  shutdown: function() {
    Trace.sysout("InspectorService.shutdown;");

    off(DebuggerClient, "connect", this.onDebuggerClientConnect);

    // TODO: cleanup clientsMap

    this.unregisterActors();
  },

  getConnectionsInfo() {
    let localTabsConnections = [];
    let webideConnections = [];
    let otherConnections = [];

    for (let conn of this.clientsMap.values()) {
      let connDesc = { uuid: conn.uuid };

      if (conn.webide) {
        connDesc.name = conn.webide.selectedRuntime.name;

        webideConnections.push(connDesc);
      } else if (conn.toolbox && conn.toolbox.target.isLocalTab) {
        connDesc.name = conn.toolbox.target.tab.label;

        localTabsConnections.push(connDesc);
      } else {
        otherConnections.push({
          uuid: conn.uuid,
          name: conn.uuid,
        });
      }
    }

    let connectionsMap = {
      "local_tabs": {
        label: Locale.$STR("rdpConnections.tab.LocalTabs"),
        connections: localTabsConnections
      },
      "webide": {
        label: Locale.$STR("rdpConnections.tab.WebIDE"),
        connections: webideConnections
      },
      "other": {
        label: "Other",
        connections: otherConnections
      }
    };

    return connectionsMap;
  },

  openRDPInspectorWindow(uuidConn) {
    if (this.clientsByUUID.has(uuidConn)) {
      let conn = this.clientsByUUID.get(uuidConn);
      let { toolbox } = conn;

      if (toolbox) {
        Dispatcher.emit("onToggleRDPInspector", [{ toolbox }]);
      } else {
        toolbox = new devtools.Toolbox({
          makeRemote: function() {},
          client: conn.client,
          on: () => {}
        }, null, devtools.Toolbox.HostType.WINDOW);
        toolbox.isFakeToolbox = true;
        gDevTools.emit("toolbox-created", toolbox);
      }
    }
  },

  _setClientInfo(client, moreInfo) {
    if (!client) {
      return;
    }
    let clientInfo = this.clientsMap.get(client) || {
      uuid: uuid().toString(),
      client
    };

    delete moreInfo["uuid"];
    let updatedInfo = Object.assign({}, clientInfo, moreInfo);
    this.clientsMap.set(client, updatedInfo);
    this.clientsByUUID.set(clientInfo.uuid, updatedInfo);
  },

  // Toolbox Events

  onToolboxOverlay: function({ toolbox, overlay }) {
    this._setClientInfo(toolbox.target.client, {
      toolbox, toolboxOverlay: overlay
    });

    let clientInfo = this.clientsMap.get(toolbox.target.client);

    let autoOpenInspectorConsole = false;

    if (toolbox.isFakeToolbox || (clientInfo && clientInfo.webide && prefs.autoOpenOnWebIDEConnection)) {
      autoOpenInspectorConsole = true;
    }

    if (autoOpenInspectorConsole) {
      Dispatcher.emit("onToggleRDPInspector", [{ toolbox }]);
    }

    Dispatcher.emit("onRDPConnectionsUpdated", []);
  },

  onToolboxReady: function(eventId, toolbox) {
    Trace.sysout("InspectorService.onToolboxReady;", toolbox);
  },

  onToolboxDestroy: function(/*eventId, toolbox*/) {
    Trace.sysout("InspectorService.onToolboxDestroy;");
  },

  // WebIDE Connections Events

  onWebIDEConnectionCreated: function(/*{ connection, selectedRuntime }*/) {
    Trace.sysout("InspectorService.onWebIDEConnectionCreated");
  },

  onWebIDEConnectionReady: function({ connection, selectedRuntime }) {
    Trace.sysout("InspectorService.onWebIDEConnectionReady");

    this._setClientInfo(connection.client, {
      webide: { selectedRuntime, connection }
    });

    Dispatcher.emit("onRDPConnectionsUpdated", []);
  },

  // Start button events

  onToggleRDPInspector: function({ toolbox }) {
    Trace.sysout("InspectorService.onToggleRDPInspector;", toolbox);

    let inspectorWindowName;

    let clientInfo = this.clientsMap.get(toolbox.target.client);

    if (toolbox.isFakeToolbox) {
      inspectorWindowName = `Other: ${clientInfo.uuid}`;
    } else if (clientInfo && clientInfo.webide) {
      inspectorWindowName = `WebIDE: ${clientInfo.webide.selectedRuntime.name}`;
    } else if (toolbox.target.isLocalTab) {
      inspectorWindowName = `Tab: ${toolbox.target.tab.label}`;
    }

    if (clientInfo && clientInfo.toolboxOverlay) {
      clientInfo.toolboxOverlay.openInspectorWindow(inspectorWindowName);
    }
  },

  // Connection Events

  onDebuggerClientConnect: function(client) {
    Trace.sysout("InspectorService.onDebuggerClientConnect;", client);

    client.addOneTimeListener("closed", () => {
      this.onDebuggerClientClosed(client);
    });

    this._setClientInfo(client, {});
    Dispatcher.emit("onRDPConnectionsUpdated", []);
  },

  onDebuggerClientClosed: function(client) {
    Trace.sysout("InspectorService.onDebuggerClientClosed;", client);

    // TODO: any more cleanup tasks needed here?
    // TODO: probably we should leave the window open?
    let clientInfo = this.clientsMap.get(client);
    if (clientInfo && clientInfo.toolboxOverlay) {
      clientInfo.toolboxOverlay.destroy();
    }

    this.clientsMap.delete(client);

    Dispatcher.emit("onRDPConnectionsUpdated", []);
  },

  // Backend Actors

  registerInspectorActor: function(toolbox) {
    Trace.sysout("InspectorService.registerInspectorActor;");

    // Inspector actor registration options.
    let config = {
      prefix: "actorInspector",
      actorClass: "InspectorActor",
      frontClass: InspectorFront,
      moduleUrl: actorModuleUrl,
      // NOTE: the following option asks firebug.sdk to mark custom actors registering RDP packets
      // as rdpInspectorInternals (which helps to filter out them from the packet list)
      customAttributes: {
        rdpInspectorInternals: true
      }
    };

    let deferred = defer();
    let client = toolbox.target.client;

    // xxxHonza: the registration should be done in one step
    // using Rdp.registerActor() API

    // Register as global actor.
    let global = Rdp.registerGlobalActor(client, config).
      then(({registrar, front}) => {
        this.globalRegistrar = registrar;
        return front;
      });

    // Register as tab actor.
    let tab = Rdp.registerTabActor(client, config).
      then(({registrar, front}) => {
        this.tabRegistrar = registrar;
        return front;
      });

    // Wait till both registrations are done.
    all([global, tab]).then(results => {
      deferred.resolve({
        global: results[0],
        tab: results[1]
      });
    });

    return deferred.promise;
  },

  unregisterActors: function() {
    if (this.globalRegistrar) {
      this.globalRegistrar.unregister().then(() => {
        Trace.sysout("inspectoService.unregisterActors; global actor " +
          "unregistered", arguments);
      });
    }

    if (this.tabRegistrar) {
      this.tabRegistrar.unregister().then(() => {
        Trace.sysout("inspectoService.unregisterActors; tab actor " +
          "unregistered", arguments);
      });
    }
  },

  // Accessors

  /**
   * Returns client objects for both, global and tab inspector actors.
   *
   * @returns {Object} An object with two clients objects. The 'global'
   * property represents front to the global actor and the 'tab' property
   * represents front to the the tab (aka child) actor.
   */
  getInspectorClients: function(toolbox) {
    return this.registerInspectorActor(toolbox);
  }
};

// Registration
Dispatcher.register(InspectorService);

// Exports from this module
exports.InspectorService = InspectorService;
