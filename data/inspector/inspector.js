/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
var $ = require("jquery");
var React = require("react");

var { Pools } = require("pools");
var { renderTabbedBox } = require("tabs");
var { renderToolbar } = require("toolbar");
var { Factories } = require("factories");
var { PacketsTabBody } = require("packets-tab-body");

// Reps

var packets = [];

// Initial panel rendering
renderToolbar();
renderTabbedBox();

var actions = {
  selectPacket: function(packet) {
    packetList.setState({selectedPacket: packet});
  }
};

// Render packet list.
var packetList = React.render(PacketsTabBody({packets: packets, actions: actions}),
  document.querySelector("#tabPacketsPane"));
var globalActorsPane = Pools.render(
  document.querySelector("#globalActorsPane"));
var tabActorsPane = Pools.render(
  document.querySelector("#tabActorsPane"));
var actorFactoriesPane = Factories.render(
  document.querySelector("#actorFactoriesPane"));

/**
 * Renders content of the Inspector panel.
 */
function onRefresh(event) {
  var packet = JSON.parse(event.data);
  refreshActors(packet[0], globalActorsPane);
  refreshActors(packet[1], tabActorsPane);
  refreshFactories(packet[0], packet[1]);
  refreshPackets();
}

function onSearch(event) {
  var value = JSON.parse(event.data);

  packetList.setState({ searchFilter: value });
  globalActorsPane.setState({ searchFilter: value });
  tabActorsPane.setState({ searchFilter: value });
  actorFactoriesPane.setState({ searchFilter: value });
}

function onClear() {
  packets = [];
  refreshPackets();
}

function refreshActors(data, poolPane) {
  var pools = [data.actorPool];
  pools.push.apply(pools, data.extraPools.slice());

  poolPane.setState({pools: pools});
}

function refreshFactories(main, child) {
  actorFactoriesPane.setState({main: main, child: child});
}

/**
 * RDP Transport Listener
 */
function onInitPacketList(event) {
  var packets = JSON.parse(event.data);

  for (var i=0; i<packets.length; i++) {
    var packet = packets[i];
    appendPacket({
      type: packet.type,
      packet: packet.packet,
      size: JSON.stringify(packet.packet).length,
      time: new Date(packet.time)
    });
  }
}

function onSendPacket(event) {
  appendPacket({
    type: "send",
    packet: JSON.parse(event.data),
    size: event.data.length,
    time: new Date()
  });
}

function onReceivePacket(event) {
  appendPacket({
    type: "receive",
    packet: JSON.parse(event.data),
    size: event.data.length,
    time: new Date()
  });
}

function appendPacket(packet) {
  packets.push(packet);

  // xxxHonza: limit for now.
  if (packets.length > 100) {
    packets.shift();
  }

  refreshPackets();
}

function onPacketSelected(packet) {
  packetList.setState({ selectedPacket: packet });
}

// xxxHonza: refactor into an utility object.
var timeout;
function refreshPackets() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  // Refresh on timeout to avoid to many re-renderings.
  timeout = setTimeout(() => {
    packetList.setState({ data: packets });
    timeout = null;
  }, 200);
}

function onResize() {
  document.body.style.height = window.innerHeight + "px";
  document.body.style.width = window.innerWidth + "px";
}

onResize();

// Register event listeners
window.addEventListener("refresh", onRefresh);
window.addEventListener("clear", onClear);
window.addEventListener("send-packet", onSendPacket);
window.addEventListener("receive-packet", onReceivePacket);
window.addEventListener("search", onSearch);
window.addEventListener("init-packet-list", onInitPacketList);
window.addEventListener("resize", onResize);

// Send notification about initialization being done.
postChromeMessage("initialized");

});
