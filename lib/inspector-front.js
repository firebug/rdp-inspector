/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Add-on SDK
const { Cu } = require("chrome");

// Firebug SDK
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);

// DevTools
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});
const { Front, FrontClass } = devtools["require"]("devtools/server/protocol");

// RDP Inspector
const { InspectorActor } = require("./inspector-actor.js");

/**
 * @front TODO: documentation
 */
var InspectorFront = FrontClass(InspectorActor,
/** @lends InspectorFront */
{
  // Initialization

  initialize: function(client, form) {
    Front.prototype.initialize.apply(this, arguments);

    Trace.sysout("inspectorFront.initialize;", this);

    this.actorID = form[InspectorActor.prototype.typeName];
    this.manage(this);
  },

  onAttached: function(response) {
    Trace.sysout("inspectorFront.onAttached; ", response);
  },

  onDetached: function(response) {
    Trace.sysout("inspectorFront.onDetached; ", response);
  }
});

// Helpers

// Exports from this module
exports.InspectorFront = InspectorFront;
