/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Firebug SDK
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);

// DevTools
// See also: https://bugzilla.mozilla.org/show_bug.cgi?id=912121
const DevTools = require("firebug.sdk/lib/core/devtools.js");
const { Front, FrontClass } = DevTools.Protocol;

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
