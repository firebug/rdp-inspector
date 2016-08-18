/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "experimental"
};

// Add-on SDK
const { Class } = require("sdk/core/heritage");
const { EventTarget } = require("sdk/event/target");

// Firebug SDK
const { Trace/*, TraceError*/ } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Arr } = require("firebug.sdk/lib/core/array.js");
//const { Options } = require("firebug.sdk/lib/core/options.js");

/**
 * This object registers a listener in transport layer that is associated
 * with given client object {@DebuggerClient}. All sent and received
 * packets are consequently forwarded to other listeners.
 * One of the listeners is the {@ToolboxOverlay} object that implements
 * packet caching (and also forwards packets to RDP Window if it exists).
 */
const TransportObserver = Class(
/** @lends TransportObserver */
{
  extends: EventTarget,

  // Initialization

  initialize: function(options) {
    Trace.sysout("TransportObserver.initialize;", options);

    this.listeners = [];

    this.client = options.client;

    this.send = this.send.bind(this);
    this.onPacket = this.onPacket.bind(this);
    this.onBulkPacket = this.onBulkPacket.bind(this);
    this.startBulkSend = this.startBulkSend.bind(this);
    this.onClosed = this.onClosed.bind(this);

    let transport = this.client._transport;
    transport.on("send", this.send);
    transport.on("onPacket", this.onPacket);
    transport.on("onBulkPacket", this.onBulkPacket);
    transport.on("startBulkSend", this.startBulkSend);
    transport.on("onClosed", this.onClosed);

    transport.on("packet", this.onPacket);
    transport.on("bulkpacket", this.onBulkPacket);
    transport.on("startbulksend", this.startBulkSend);
    transport.on("close", this.onClosed);
  },

  destroy: function() {
    Trace.sysout("TransportObserver.destroy;");

    let transport = this.client._transport;
    transport.off("send", this.send);
    transport.off("onPacket", this.onPacket);
    transport.off("onBulkPacket", this.onBulkPacket);
    transport.off("startBulkSend", this.startBulkSend);
    transport.off("onClosed", this.onClosed);

    transport.off("packet", this.onPacket);
    transport.off("bulkpacket", this.onBulkPacket);
    transport.off("startbulksend", this.startBulkSend);
    transport.off("close", this.onClosed);
  },

  // Connection Events

  send: function(eventId, packet) {
    Trace.sysout("PACKET SEND " + JSON.stringify(packet), packet);

    packet = JSON.parse(JSON.stringify(packet));

    this.listeners.forEach(listener => {
      listener.onSendPacket(packet);
    });
  },

  onPacket: function(eventId, packet) {
    Trace.sysout("PACKET RECEIVED; " + JSON.stringify(packet), packet);

    packet = JSON.parse(JSON.stringify(packet));

    this.listeners.forEach(listener => {
      listener.onReceivePacket(packet);
    });
  },

  startBulkSend: function(/*eventId, header*/) {
  },

  onBulkPacket: function(/*eventId, packet*/) {
  },

  onClosed: function(/*eventId, status*/) {
  },

  // Listeners

  addListener: function(listener) {
    this.listeners.push(listener);
  },

  removeListener: function(listener) {
    Arr.remove(this.listeners, listener);
  }
});

// Exports from this module
exports.TransportObserver = TransportObserver;
