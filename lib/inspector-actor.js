/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cu } = require("chrome");

// DevTools
// See also: https://bugzilla.mozilla.org/show_bug.cgi?id=912121
var devtools;
try {
  devtools = Cu.import("resource://gre/modules/devtools/shared/Loader.jsm", {}).devtools;
} catch (err) {
  devtools = Cu.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
}

const { DebuggerServer } = devtools["require"]("devtools/server/main");
const protocol = devtools["require"]("devtools/server/protocol");
const { method, RetVal, ActorClass, Actor } = protocol;

// For debugging purposes. Note that the tracing module isn't available
// on the backend (in case of remote device debugging).
// const baseUrl = "resource://rdpinspector-at-getfirebug-dot-com/";
// const { getTrace } = Cu.import(baseUrl + "node_modules/firebug.sdk/lib/core/actor.js");
// const Trace = getTrace();
const Trace = {sysout: () => {}};

function dumpFactories(factories) {
  let result = [];

  let props = Object.getOwnPropertyNames(factories);
  for (let name of props) {
    let factory = factories[name];
    result.push({
      name: factory.name,
      prefix: factory._prefix,
      constructor: factory.constructor ? factory.constructor.name : undefined
    });
  }

  return result;
}

/**
 * Helper actor state watcher.
 */
function expectState(expectedState, calledMethod) {
  return function(...args) {
    if (this.state !== expectedState) {
      Trace.sysout("actor.expectState; ERROR wrong state, expected '" +
        expectedState + "', but current state is '" + this.state + "'" +
        ", method: " + calledMethod);

      let msg = "Wrong State: Expected '" + expectedState + "', but current " +
        "state is '" + this.state + "'";

      return Promise.reject(new Error(msg));
    }

    try {
      return calledMethod.apply(this, args);
    } catch (err) {
      Cu.reportError("actor.js; expectState EXCEPTION " + err, err);
    }
  };
}

/**
 * @actor TODO docs
 */
var InspectorActor = ActorClass(
/** @lends InspectorActor */
{
  typeName: "actorInspector",

  // Initialization

  initialize: function(conn, parent) {
    Trace.sysout("InspectorActor.initialize; parent: " +
      parent.actorID + ", conn: " + conn.prefix, this);

    Actor.prototype.initialize.call(this, conn);

    this.parent = parent;
    this.state = "detached";
  },

  /**
   * The destroy is only called automatically by the framework (parent actor)
   * if an actor is instantiated by a parent actor.
   */
  destroy: function() {
    Trace.sysout("InspectorActor.destroy; state: " + this.state, arguments);

    if (this.state === "attached") {
      this.detach();
    }

    Actor.prototype.destroy.call(this);
  },

  /**
   * Automatically executed by the framework when the parent connection
   * is closed.
   */
  disconnect: function() {
    Trace.sysout("InspectorActor.disconnect; state: " + this.state, arguments);

    if (this.state === "attached") {
      this.detach();
    }
  },

  /**
   * Attach to this actor. Executed when the front (client) is attaching
   * to this actor.
   */
  attach: method(expectState("detached", function() {
    Trace.sysout("monitorActor.attach;", arguments);

    this.state = "attached";
  }), {
    request: {},
    response: {
      type: "attached"
    }
  }),

  /**
   * Detach from this actor. Executed when the front (client) detaches
   * from this actor.
   */
  detach: method(expectState("attached", function() {
    Trace.sysout("monitorActor.detach;", arguments);

    this.state = "detached";
  }), {
    request: {},
    response: {
      type: "detached"
    }
  }),

  // Actor API

  /**
   * A test remote method.
   */
  getActors: method(expectState("attached", function() {
    let result = {};

    Trace.sysout("inspectorActor.getActors; connection ", this.conn);

    // Get actor pools (instances)
    if (this.conn._actorPool) {
      result.actorPool = {
        pool: dumpPool(this.conn._actorPool),
        id: this.conn._actorPool.id
      };
    }

    result.extraPools = [];

    for (let pool of this.conn._extraPools) {
      if (pool !== this.conn._actorPool) {
        result.extraPools.push({
          pool: dumpPool(pool),
          id: pool.id
        });
      }
    }

    // Get actor factories (classes)
    result.factories = {};
    result.factories.global = dumpFactories(DebuggerServer.globalActorFactories);
    result.factories.tab = dumpFactories(DebuggerServer.tabActorFactories);

    return result;
  }), {
    request: {},
    response: RetVal("json")
  })
});

// Helpers

function dumpPool(pool) {
  let result = [];

  if (pool._actors) {
    pool.forEach(actor => {
      result.push({
        actorID: actor.actorID,
        actorPrefix: actor.actorPrefix,
        typeName: actor.typeName,
        parentID: actor._parentActor ? actor._parentActor.actorID : undefined,
        constructor: actor.constructor ? actor.constructor.name : undefined
      });
    });
  } else {
    // xxxHonza: there are actors (classes) stored as pools.
    // See also: https://bugzilla.mozilla.org/show_bug.cgi?id=1119790#c1
    result = {};
    result.actorID = pool.actorID;
    result.actorPrefix = pool.actorPrefix;
    result.typeName = pool.typeName;
    result.parentID = pool.parentID;
  }

  return result;
}

// Exports from this module
exports.InspectorActor = InspectorActor;
