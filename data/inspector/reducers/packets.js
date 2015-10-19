/* See license.txt for terms of usage */

define(function(require, exports, module) {

"use strict";

// RDP Window injected APIs
const { Options, Locale } = require("shared/rdp-inspector-window");
const { StackTrace } = require("../components/stack-frame-rep");

// actions types
const { types } = require("../actions/packets");

/**
 * Initial state definition
 */
const initialState = {
  paused: false,
  uniqueId: 0,
  options: {},
  filter: null,
  editedPacket: null,
  selectedPacket: null,
  removedPackets: 0,
  filteredPackets: [],
  packets: [],
  summary: {
    data: { sent: 0, received: 0},
    packets: { sent: 0, received: 0}
  },
  error: null,
};

function packetsReducer(state = initialState, action) {
  switch(action.type) {
    case types.IMPORT_PACKETS_FROMFILE:
      return importPacketsFromFile(state, action.data);
  case types.IMPORT_PACKETS_CACHE:
    return importPacketsCache(state, action.cache);
  case types.INIT_PACKETLIST_OPTIONS:
    return initPacketListOptions(state, action.options);
  case types.TOGGLE_PACKETLIST_OPTION:
    return togglePacketListOption(state, action.name);
  case types.TOGGLE_PACKETLIST_PAUSE:
    return togglePacketListPause(state);
  case types.APPEND_PACKET:
    return appendPacket(state, action.packetType, action.packetData);
  case types.APPEND_SUMMARY:
    return appendSummary(state, action.time);
  case types.APPEND_MESSAGE:
    return appendMessage(state, action.message, action.time);
  case types.SELECT_PACKET:
    return selectPacket(state, action.packet);
    case types.EDIT_PACKET:
      return editPacket(state, action.packet);
  case types.SET_PACKET_FILTER:
    return setPacketFilter(state, action.filter);
  case types.CLEAR_PACKET_LIST:
    return clearPacketList(state);
  case types.SET_PACKETLIST_ERROR:
    return setPacketListError(state, action.error);
  default:
    return state;
  }
}

module.exports = packetsReducer;

// helpers

function importPacketsFromFile(state, data) {
  let removedPackets = data.removedPackets || 0;
  let newState = clearPacketList(state);

  if (data.packets && data.packets.length > 0) {
    for (let packet of data.packets) {
      newState = appendToCollectedPackets(newState, packet);
    }
  }

  return Object.assign({}, newState, { removedPackets });
}

function importPacketsCache(state, cache) {
  let removedPackets = cache.removedPackets || 0;
  let newState = state;

  if (cache.packets && cache.packets.length > 0) {
    for (let packet of cache.packets) {
      // TODO: Trace errors
      newState = appendPacket(newState, packet.type, packet);
    }
  }

  return Object.assign({}, newState, { removedPackets });
}

function initPacketListOptions(state, options) {
  return Object.assign({}, state, {
    options
  });
}

function togglePacketListOption(state, name) {
  let options = JSON.parse(JSON.stringify(state.options));
  options[name] = !options[name];

  return Object.assign({}, state, {
    options
  });
}

function togglePacketListPause(state) {
  let paused = !state.paused;
  let newState;

  if (paused) {
    newState = appendMessage(state, Locale.$STR("rdpInspector.label.Paused"), new Date());
  } else {
    newState = appendMessage(state, Locale.$STR("rdpInspector.label.Unpaused"), new Date());
  }

  return Object.assign({}, newState, {
    paused
  });
}

function appendToCollectedPackets(state, packet) {
  let limit = Options.getPref("extensions.rdpinspector.packetLimit");

  if (state.packets.length >= limit) {
    state.packets.shift();
  }

  let summary = JSON.parse(JSON.stringify(state.summary));

  switch (packet.type) {
  case "send":
    summary.data.sent += packet.size;
    summary.packets.sent += 1;
    break;
  case "receive":
    summary.data.received += packet.size;
    summary.packets.received += 1;
    break;
  }

  packet.id = ++state.uniqueId;

  let packets = [ ...state.packets, packet];
  let filteredPackets = filterRDPInspectPackets(packets);

  return Object.assign({}, state, {
    summary, packets, filteredPackets
  });
}

function appendPacket(state, packetType, packetData) {
  let rawPacket = JSON.stringify(packetData.packet);
  let packet = {
    type: packetType,
    packet: packetData.packet,
    rawPacket,
    size: rawPacket.length,
    time: new Date(packetData.time),
    stack: new StackTrace(packetData.stack, packetType)
  };

  return appendToCollectedPackets(state, packet);
}

function appendSummary(state, time) {
  return appendToCollectedPackets(state, {
    type: "summary",
    time,
    data: {
      sent: state.summary.data.sent,
      received: state.summary.data.received
    },
    packets: {
      sent: state.summary.packets.sent,
      received: state.summary.packets.received
    }
  });
}

function appendMessage(state, message, time) {
  return appendToCollectedPackets(state, {
    type: "message", time, message
  });
}

function selectPacket(state, packet) {
  return Object.assign({}, state, {
    selectedPacket: packet
  });
}

function editPacket(state, packet) {
  return Object.assign({}, state, {
    editedPacket: packet
  });
}

function setPacketFilter(state, filter) {
  return Object.assign({}, state, {
    filter
  });
}

function clearPacketList(state) {
  return Object.assign({}, state, {
    selectedPacket: null,
    packets: [],
    filteredPackets: [],
    summary: JSON.parse(JSON.stringify(initialState.summary))
  });
}

function setPacketListError(state, error) {
  // TODO: Trace errors
  return Object.assign({}, state, { error });
}

function filterRDPInspectPackets(packets) {
  var filterFrom = {};

  return packets.filter((packet) => {
    var actorId = packet.packet ? (packet.packet.to || packet.packet.from) : null;

    // filter our all the RDPi actorInspector actor
    if (actorId && actorId.indexOf("actorInspector") > 0) {
      return false;
    }

    if (packet.type == "send") {
      // filter sent RDP packets needed to register the RDPi actorInspector actor
      if (packet.packet.rdpInspectorInternals) {
        filterFrom[packet.packet.to] = filterFrom[packet.packet.to] || 0;
        filterFrom[packet.packet.to] += 1;

        return false;
      }

      // filter sent RDP packets needed to register the RDPi actorInspector actor
      if (packet.packet.type == "registerActor" &&
          packet.packet.filename.indexOf("rdpinspector-at-getfirebug-dot-com") > 0) {
        filterFrom[packet.packet.to] = filterFrom[packet.packet.to] || 0;
        filterFrom[packet.packet.to] += 1;
        return false;
      }
    }

    // filter received RDP packets needed to register the RDPi actorInspector actor
    if (packet.type == "receive" && filterFrom[packet.packet.from] > 0) {
      filterFrom[packet.packet.from] -= 1;
      return false;
    }

    return true;
  });
}

});
