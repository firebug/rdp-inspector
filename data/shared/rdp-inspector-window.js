/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

if (["http:", "https:", "file:"].indexOf(window.location.protocol) >= 0) {
    // NOTE: add RDPi injected APIs shims, to be able to run the React UI in a tab
    exports.Locale = window.Locale = {
      $STR: function(s) { return s; }
    };

    exports.Options = window.Options = {
      getPref: function(key) {
        /* eslint no-console: 0 */
        switch(key) {
        case "extensions.rdpinspector.packetLimit":
          return 100;
        default:
          throw Error("UNKNOWN Option.getPref: " + key);
        }
      }
    };

    exports.Str = window.Str = {
      formatSize: function(str) { return str; }
    };

    exports.Trace = window.Trace = {
      sysout: function(...args) {
        console.log.apply(console, args);
      }
    };

    exports.postChromeMessage = window.postChromeMessage = function() {
      console.log("POST CHROME MESSAGE", arguments);
    };

    exports.RDPConnectionList = {
      getConnectionsInfo: () => {},
      onConnectionsUpdated: {
        addListener: function() {},
        removeListener: function() {}
      },
      openRDPInspectorWindow: () => {}
    };

    // inject domTree css with a relative url (chrom urls can't be
    // loaded in a page not loaded from a resource or chrome urls)

    const domTreeStylesheet = document.createElement("link");
    domTreeStylesheet.setAttribute("href", "../../node_modules/firebug.sdk/skin/classic/shared/domTree.css");
    domTreeStylesheet.setAttribute("rel", "stylesheet");

    document.querySelector("head").appendChild(domTreeStylesheet);
} else {
  /* globals Str, Locale, Options, Trace, postChromeMessage */
  exports.Str = Str;
  exports.Locale = Locale;
  exports.Options = Options;
  exports.Trace = Trace;

  if ("postChromeMessage" in window) {
    exports.postChromeMessage = window.postChromeMessage;
  }

  if ("RDPConnectionList" in window) {
    exports.RDPConnectionList = window.RDPConnectionList;
  }
}

function RDPInspectorView({ window, actions, store }) {
  this.win = window;
  this.actions = actions;
  this.store = store;

  // subscribe window events
  let subscriptions = [
    [ "init-options", "onInitOptions" ],
    [ "init-packet-list", "onInitPacketList" ],
    [ "send-packet", "onSendPacket" ],
    [ "receive-packet", "onReceivePacket" ],
    [ "loaded-packet-list-file", "onLoadedPacketListFile" ],
    [ "got-rdp-actors", "onGotRDPActors" ]
  ];

  for (let [ message, handler ] of subscriptions) {
    this[handler] = this[handler].bind(this);
    this.win.addEventListener(message, this[handler], false);
  }
}

exports.RDPInspectorView = RDPInspectorView;

RDPInspectorView.prototype = {
  // listeners
  onInitOptions(event) {
    let options = JSON.parse(event.data);
    let { store, actions } = this;
    store.dispatch(actions.initPacketListOptions(options));
  },

  onInitPacketList(event) {
    let cache = JSON.parse(event.data);
    let { store, actions } = this;
    store.dispatch(actions.importPacketsCache(cache));
    store.dispatch(actions.appendSummary());
  },

  onSendPacket(event) {
    let packetData = JSON.parse(event.data);
    let { store, actions } = this;
    store.dispatch(actions.appendPacket("send", packetData));
  },

  onReceivePacket(event) {
    let packetData = JSON.parse(event.data);
    let { store, actions } = this;
    store.dispatch(actions.appendPacket("receive", packetData));
  },

  onGotRDPActors(event) {
    let actors = JSON.parse(event.data);
    let { store, actions } = this;
    store.dispatch(actions.setActors(actors));
  },

  onLoadedPacketListFile(event) {
    let { store, actions } = this;

    try {
      var data = deserializePacketsStore(event.data);
      store.dispatch(actions.importPacketsFromFile(data));
    } catch(e) {
      store.dispatch(actions.setPacketListError({
        message: "Error loading packets from file",
        details: e
      }));
    }
  },

  // app event handlers

  clearError() {
    let { store, actions } = this;
    store.dispatch(actions.setPacketListError(null));
  },

  selectPacket(packet) {
    let { store, actions } = this;
    store.dispatch(actions.selectPacket(packet));
  },

  editPacket(packet) {
    let { store, actions } = this;
    store.dispatch(actions.editPacket(packet));
    // TODO: remove this workaround
    window.dispatchEvent(new CustomEvent("rdpinspector:switchToPacketEditorTab"));
  },

  clear() {
    let { store, actions } = this;
    store.dispatch(actions.clearPacketList());
  },

  find() {
    postChromeMessage("find");
  },

  send(packet) {
    postChromeMessage("inject-rdp-packet", packet);
  },

  getActors() {
    postChromeMessage("get-rdp-actors");
  },

  appendSummary() {
    let { store, actions } = this;
    store.dispatch(actions.appendSummary());

    // Auto scroll to the bottom, so the new summary is
    // immediately visible.
    var node = document.querySelector(".packetsPanelBox .list");
    node.scrollTop = node.scrollHeight;
  },

  onShowInlineDetails() {
    let { store, actions } = this;
    store.dispatch(actions.togglePacketListOption("showInlineDetails"));
    postChromeMessage("options-toggle", { name: "showInlineDetails"});
  },

  onPacketCacheEnabled() {
    let { store, actions } = this;
    store.dispatch(actions.togglePacketListOption("packetCacheEnabled"));
    postChromeMessage("options-toggle", { name: "packetCacheEnabled"});
  },

  onPause() {
    let { store, actions } = this;
    store.dispatch(actions.togglePacketListPause());
    postChromeMessage("pause", store.getState().packets.paused);
  },

  loadPacketsFromFile() {
    postChromeMessage("load-from-file");
  },

  savePacketsToFile() {
    let { store, actions } = this;
    try {
      var json = serializePacketsStore(store.getState().packets);
    } catch(e) {
      store.dispatch(actions.setPacketListError({
        message: "Error saving packets to file",
        details: e
      }));
      return;
    }

    postChromeMessage("save-to-file", {
      data: json,
      contentType: "application/json",
      filename: "RDP-packets-dump.json"
    });
  },

  onViewSource(sourceLink) {
    postChromeMessage("view-source", sourceLink);
  },
};

// serialize / deserialze helpers

const DUMP_FORMAT_VERSION = "rdp-inspector/packets-store/v1";
const DUMP_FORMAT_KEYS = [
  "packets", "summary",
  "uniqueId", "removedPackets"
];

function serializePacketsStore(packetsStore) {
  var data = {
    "!format!": DUMP_FORMAT_VERSION
  };
  DUMP_FORMAT_KEYS.forEach((key) => {
    data[key] = packetsStore[key];
  });
  return JSON.stringify(data);
}

function deserializePacketsStore(rawdata) {
  var data = JSON.parse(rawdata, (k, v) => {
    switch (k) {
    case "time":
      return new Date(v);
    default:
      return v;
    }
  });

  var res = {};

  if (data["!format!"] &&
      data["!format!"] === DUMP_FORMAT_VERSION) {
    DUMP_FORMAT_KEYS.forEach((key) => {
      res[key] = data[key];
    });
  } else {
    throw Error("Dump file format unrecognized");
  }

  return res;
}

});
