/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cu, Ci } = require("chrome");

// Firebug.SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");

// RDP Inspector
const { StartButton } = require("./start-button.js");

// Localization files
Locale.registerStringBundle("chrome://rdpinspector/locale/toolbox.properties");

/**
 * Extension's entry point. Read MDN to learn more about Add-on SDK:
 * https://developer.mozilla.org/en-US/Add-ons/SDK
 */
function main(options, callbacks) {
  StartButton.initialize(options);
}

function onUnload(reason) {
}

// Exports from this module
exports.main = main;
exports.onUnload = onUnload;
