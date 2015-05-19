/* See license.txt for terms of usage */
/* globals Locale, postChromeMessage */

define(function(require, exports, module) {

"use strict";

// ReactJS
var React = require("react");

// RDP Inspector
var { MainTabbedArea } = require("components/main-tabbed-area");
var { PacketsStore } = require("packets-store");
var { ActorsStore } = require("actors-store");
var { Resizer } = require("resizer");
var { Search } = require("search");

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
    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.onchange = () => {
      var reader = new FileReader();
      reader.onload = () => {
        try {
          packetsStore.deserialize(reader.result);
        } catch(e) {
          theApp.setState({
            error: {
              message: "Error loading packets from file",
              details: e
            }
          });
        }
      };
      reader.readAsText(input.files[0]);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  },
  savePacketsToFile: function() {
    try {
      var blob = new Blob([packetsStore.serialize()],
                          { type: contentType });
    } catch(e) {
      theApp.setState({
        error: {
          message: "Error saving packets to file",
          details: e
        }
      });
      return;
    }

    var contentType = "application/json";
    var a = document.createElement("a");
    a.setAttribute("href", window.URL.createObjectURL(blob));
    a.setAttribute("download", "RDP-packets-dump.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/**
 * Render the main application component. It's the main tab bar displayed
 * at the top of the window. This component also represents ReactJS root.
 */
var content = document.getElementById("content");
var theApp = React.render(MainTabbedArea({
  actions: actions
}), content);

// Helper modules for handling application events.
var packetsStore = new PacketsStore(window, theApp);
var actorsStore = new ActorsStore(window, theApp);
var resizer = new Resizer(window, theApp);
var search = new Search(window, theApp);

// Send notification about initialization being done.
postChromeMessage("initialized");

// End of main.js
});
