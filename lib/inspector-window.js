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
const { Content } = require("firebug.sdk/lib/core/content.js");
const { Str } = require("firebug.sdk/lib/core/string.js");

// Constants
const windowType = "rdp-inspector";

/**
 * xxxHonza: TODO docs
 */
const InspectorWindow = Class(
/** @lends InspectorWindow */
{
  // Initialization

  initialize: function(toolboxOverlay) {
    this.toolboxOverlay = toolboxOverlay;
    this.toolbox = toolboxOverlay.toolbox;

    this.toolboxOverlay.transportListener.addListener(this);

    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);
  },

  destroy: function() {
    this.toolboxOverlay.transportListener.removeListener(this);

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
    this.win = openDialog({
      url: url,
      name: Locale.$STR("rdpInspector.startButton.title"),
      args: params,
      features: "chrome,resizable,scrollbars=auto,minimizable," +
        "dialog=no,width=500,height=500"
    });

    let { Trace: contentTrace } = FBTrace.get("CONTENT");

    Content.exportIntoContentScope(this.win, Str, "Str");
    Content.exportIntoContentScope(this.win, Locale, "Locale");
    Content.exportIntoContentScope(this.win, contentTrace, "Trace");
    Content.exportIntoContentScope(this.win, TraceError, "TraceError");

    FBTrace.sysout("!!! string " + Str)

    return this.win;
  },

  // Transport Listener

  onSendPacket: function(packet) {
    this.postCommand("send-packet", JSON.stringify(packet));
  },

  onReceivePacket: function(packet) {
    this.postCommand("receive-packet", JSON.stringify(packet));
  },

  // Content <-> Chrome Communication

  postCommand: function(type, data) {
    var event = new this.win.MessageEvent(type, {
      bubbles: true,
      cancelable: true,
      data: data,
    });

    this.win.dispatchEvent(event);
  },

});

// Exports from this module
exports.InspectorWindow = InspectorWindow;
