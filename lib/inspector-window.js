/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const self = require("sdk/self");
const options = require("@loader/options");
const { Cu, Ci, Cc } = require("chrome");
const { Class } = require("sdk/core/heritage");
const { getMostRecentWindow } = require("sdk/window/utils");
const { openDialog } = require("sdk/window/utils");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");

// Constants
const windowType = "rdp-inspector";

/**
 * xxxHonza: TODO docs
 */
const InspectorWindow = Class(
/** @lends InspectorWindow */
{
  // Initialization

  initialize: function(toolbox) {
    this.toolbox = toolbox;
  },

  destroy: function() {
    if (this.win) {
      this.win.destroy();
    }
  },

  toggle: function() {
    let win = getMostRecentWindow(windowType);

    // If the Inspector is already opened, just reuse the window.
    if (win) {
      if ("initWithParams" in win) {
        win.initWithParams(params);
      }

      win.focus();
      return win;
    }

    let url = self.data.url("inspector/inspector.html");
    return this.open("rdp-inspector", url);
  },

  open: function(windowType, url, params) {
    win = openDialog({
      url: url,
      name: Locale.$STR("rdpInspector.startButton.title"),
      args: params,
      features: "chrome,resizable,scrollbars=auto,minimizable," +
        "dialog=no,width=500,height=500"
    });

    return win;
  },
});

// Exports from this module
exports.InspectorWindow = InspectorWindow;
