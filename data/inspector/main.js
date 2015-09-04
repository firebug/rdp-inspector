/* See license.txt for terms of usage */

define(function(require/*, exports, module*/) {

"use strict";

// ReactJS
var React = require("react");

// RDP Inspector
var { MainTabbedArea } = require("components/main-tabbed-area");
var { PacketsStore } = require("packets-store");
var { ActorsStore } = require("actors-store");
var { Resizer } = require("resizer");
var { Search } = require("search");

// Reps
require("./components/stack-frame-rep");

// RDP Window injected APIs
var { Locale, postChromeMessage } = require("shared/rdp-inspector-window");

var packetsStore;
var theApp;

/**
 * List of all application commands. The list is passed into
 * components (starting with theApp) and so any part of the
 * application can execute them.
 */
var actions = {
  /**
   * Select packet and display its properties in the side bar.
   */
  selectPacket: function(packet) {
    theApp.setState({selectedPacket: packet});
  },

  /**
   * Edit packet and resend it from the side bar.
   */
  editPacket: function(packet) {
    theApp.setState({editedPacket: packet});
    window.dispatchEvent(new CustomEvent("rdpinspector:switchToPacketEditorTab"));
  },

  /**
   * Remove all packets from the packet list.
   */
  clear: function() {
    packetsStore.clear();
  },

  /**
   * Open standard Firefox Find bar.
   */
  find: function() {
    postChromeMessage("find");
  },

  /**
   * Send a test packet to the debugger server.
   */
  send: function(packet) {
    postChromeMessage("inject-rdp-packet", packet);
  },

  getActors: function() {
    postChromeMessage("get-rdp-actors");
  },

  /**
   * Appends an info summary at the end of the list. The info
   * shows number of sent/received packets and total sent/received
   * amount of data.
   */
  appendSummary: function() {
    packetsStore.appendSummary();

    // Auto scroll to the bottom, so the new summary is
    // immediately visible.
    var node = document.querySelector(".packetsPanelBox .list");
    node.scrollTop = node.scrollHeight;
  },

  /**
   * Show packet properties inline - directly within the packet
   * box in the packet list.
   */
  onShowInlineDetails: function() {
    var show = !theApp.state.showInlineDetails;
    theApp.setState({showInlineDetails: show});
    postChromeMessage("options-toggle", { name: "showInlineDetails"});
  },

  /**
   * Enable/Disable packet caching when the inspector panel is still closed.
   */
   onPacketCacheEnabled: function() {
     var cache = !theApp.state.packetCacheEnabled;
     theApp.setState({packetCacheEnabled: cache});
     postChromeMessage("options-toggle", { name: "packetCacheEnabled"});
   },

  /**
   * Pause/unpause collecting packets
   */
  onPause: function() {
    var paused = !(theApp.state.paused || false);
    theApp.setState({paused: paused});

    postChromeMessage("pause", paused);

    if (paused) {
      packetsStore.appendMessage(Locale.$STR("rdpInspector.label.Paused"));
    } else {
      packetsStore.appendMessage(Locale.$STR("rdpInspector.label.Unpaused"));
    }
  },

  loadPacketsFromFile: function() {
    postChromeMessage("load-from-file");
  },

  savePacketsToFile: function() {
    try {
      var json = packetsStore.serialize();
    } catch(e) {
      theApp.setState({
        error: {
          message: "Error saving packets to file",
          details: e
        }
      });
      return;
    }

    postChromeMessage("save-to-file", {
      data: json,
      contentType: "application/json",
      filename: "RDP-packets-dump.json"
    });
  },

  onViewSource: function(sourceLink) {
    postChromeMessage("view-source", sourceLink);
  },
};

/**
 * Render the main application component. It's the main tab bar displayed
 * at the top of the window. This component also represents ReactJS root.
 */
var content = document.getElementById("content");
theApp = React.render(MainTabbedArea({
  actions: actions
}), content);

// Helper modules for handling application events.
packetsStore = new PacketsStore(window, theApp);

/* eslint-disable no-new */
new ActorsStore(window, theApp);
new Resizer(window, theApp);
new Search(window, theApp);
/* eslint-enable */

// Send notification about initialization being done.
postChromeMessage("initialized");

// End of main.js
});
