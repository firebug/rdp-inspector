/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cu, Ci } = require("chrome");

// Firebug.SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { ToolboxChrome } = require("firebug.sdk/lib/toolbox-chrome.js");

// RDP Inspector
const { StartButton } = require("./start-button.js");
const { ToolboxOverlay } = require("./toolbox-overlay.js");
const { InspectorService } = require("./inspector-service.js");

// Localization files
Locale.registerStringBundle("chrome://rdpinspector/locale/toolbox.properties");
Locale.registerStringBundle("chrome://firebug.sdk/locale/reps.properties");

/**
 * Extension's entry point. Read MDN to learn more about Add-on SDK:
 * https://developer.mozilla.org/en-US/Add-ons/SDK
 */
function main(options, callbacks) {
  Trace.sysout("main;", options);

  ToolboxChrome.initialize(options);
  ToolboxChrome.registerToolboxOverlay(ToolboxOverlay);
}

function onUnload(reason) {
  Trace.sysout("onUnload; " + reason);

  ToolboxChrome.unregisterToolboxOverlay(ToolboxOverlay);

  ToolboxChrome.shutdown(reason);
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
