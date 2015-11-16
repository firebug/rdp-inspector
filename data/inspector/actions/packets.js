/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

const types = {
  IMPORT_PACKETS_CACHE: "IMPORT_PACKETS_CACHE",
  IMPORT_PACKETS_FROMFILE: "IMPORTS_PACKETS_FROMFILE",
  INIT_PACKETLIST_OPTIONS: "INIT_PACKETLIST_OPTIONS",
  APPEND_PACKET: "APPEND_PACKET",
  APPEND_SUMMARY: "APPEND_SUMMARY",
  APPEND_MESSAGE: "APPEND_MESSAGE",
  EDIT_PACKET: "EDIT_PACKET",
  SELECT_PACKET: "SELECT_PACKET",
  CLEAR_PACKET_LIST: "CLEAR_PACKET_LIST",
  SET_PACKET_FILTER: "SET_PACKET_FILTER",
  TOGGLE_PACKETLIST_OPTION: "TOGGLE_PACKETLIST_OPTION",
  TOGGLE_PACKETLIST_PAUSE: "TOGGLE_PACKETLIST_PAUSE",
  SET_PACKETLIST_ERROR: "SET_PACKETLIST_ERROR",
};

// export actions types and action creators
module.exports = {
  types,

  importPacketsCache(cache) {
    return { type: types.IMPORT_PACKETS_CACHE, cache };
  },

  importPacketsFromFile(data) {
    return { type: types.IMPORT_PACKETS_FROMFILE, data };
  },

  initPacketListOptions(options) {
    return { type: types.INIT_PACKETLIST_OPTIONS, options };
  },

  appendPacket(packetType, packetData) {
    return { type: types.APPEND_PACKET, packetType, packetData };
  },

  appendSummary() {
    let time = new Date();
    return { type: types.APPEND_SUMMARY, time };
  },

  appendMessage(message) {
    let time = new Date();
    return { type: types.APPEND_MESSAGE, message, time };
  },

  editPacket(packet) {
    return { type: types.EDIT_PACKET, packet };
  },

  selectPacket(packet) {
    return { type: types.SELECT_PACKET, packet };
  },

  clearPacketList() {
    return { type: types.CLEAR_PACKET_LIST };
  },

  togglePacketListOption(name) {
    return { type: types.TOGGLE_PACKETLIST_OPTION, name };
  },

  togglePacketListPause() {
    return { type: types.TOGGLE_PACKETLIST_PAUSE };
  },

  setPacketListError(error) {
    return { type: types.SET_PACKETLIST_ERROR, error };
  }

};

});
