/* See license.txt for terms of usage */

define(function(require, exports, module) {

// ReactJS
var React = require("react");

// RDP Inspector
var { MainTabbedArea } = require("main-tabbed-area");
var { PacketStore } = require("packet-store");

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

// Storage with all sent and received packets.
var packetStore = new PacketStore(window, theApp);

// Event Handlers
// xxxHonza: refactor, create an extra module
function onSearch(event) {
  var value = JSON.parse(event.data);
  theApp.setState({searchFilter: value});
}

function onPacketSelected(packet) {
  theApp.setState({selectedPacket: packet});
}

function onResize() {
  document.body.style.height = window.innerHeight + "px";
  document.body.style.width = window.innerWidth + "px";
}


// Register event listeners
window.addEventListener("search", onSearch);
window.addEventListener("resize", onResize);

// Send notification about initialization being done.
postChromeMessage("initialized");

// Initialize content size
onResize();

// End of inspector.js
});
