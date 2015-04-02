/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
var React = require("react");

// RDP Inspector
var { MainTabbedArea } = require("main-tabbed-area");
var { PacketStore } = require("packet-store");
var { Resizer } = require("resizer");
var { Search } = require("search");

// List of all actions.
var actions = {
  selectPacket: function(packet) {
    theApp.setState({selectedPacket: packet});
  }
};

/**
 * Render the main application component. It's the main tab bar displayed
 * at the top of the window.
 */
var content = document.getElementById("content");
var theApp = React.render(MainTabbedArea({packets: [],
  actions: actions}), content);

// Helper modules for handling application events.
var packetStore = new PacketStore(window, theApp);
var resizer = new Resizer(window, theApp);

// Send notification about initialization being done.
postChromeMessage("initialized");

// End of inspector.js
});
