/* See license.txt for terms of usage */

define(function(require, exports, module) {

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
var actorsStore = window.actorsStore = new ActorsStore(window, theApp);
var resizer = new Resizer(window, theApp);
var search = new Search(window, theApp);

// Send notification about initialization being done.
postChromeMessage("initialized");

// End of main.js
});
