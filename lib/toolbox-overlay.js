/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const options = require("@loader/options");
const { Cu, Ci } = require("chrome");
const { Class } = require("sdk/core/heritage");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { ToolboxOverlay: ToolboxOverlayBase } = require("firebug.sdk/lib/toolbox-overlay.js");
const { TransportListener } = require("./transport-listener.js");

// RDP Inspector
const { InspectorWindow } = require("./inspector-window.js");

/**
 * @overlay xxxHonza: TODO docs
 */
const ToolboxOverlay = Class(
/** @lends ToolboxOverlay */
{
  extends: ToolboxOverlayBase,

  overlayId: "RdpInspectorToolboxOverlay",

  // Initialization

  initialize: function(options) {
    ToolboxOverlayBase.prototype.initialize.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.initialize;", options);

    let remotePromise = this.toolbox.target.makeRemote();
    let client = this.toolbox.target.client;
    this.transportListener = new TransportListener({client: client});
  },

  destroy: function() {
    ToolboxOverlayBase.prototype.destroy.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.destroy;", arguments);

    if (this.transportListener) {
      this.transportListener.destroy();
    }

    if (this.inspector) {
      this.inspector.destroy();
    }
  },

  // Events

  onReady: function(options) {
    ToolboxOverlayBase.prototype.onReady.apply(this, arguments);

    Trace.sysout("ToolboxOverlayBase.onReady;", options);
  },

  // Commands

  toggleInspector: function() {
    Trace.sysout("ToolboxOverlayBase.toggleInspector;");

    if (!this.inspector) {
      this.inspector = new InspectorWindow(this);
    }

    // Show or hide the popup panel.
    this.inspector.toggle();

    return this.inspector;
  },
});

// Exports from this module
exports.ToolboxOverlay = ToolboxOverlay;
