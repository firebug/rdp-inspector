/* See license.txt for terms of usage */

"use strict";

module.metadata = {
  "stability": "stable"
};

// Add-on SDK
const self = require("sdk/self");
/*const options = require("@loader/options");*/
const { Ci, Cc } = require("chrome");
const { Class } = require("sdk/core/heritage");
const { getMostRecentWindow } = require("sdk/window/utils");
const { openDialog } = require("sdk/window/utils");
const Events = require("sdk/dom/events");
const { all } = require("sdk/core/promise");
const simplePrefs = require("sdk/simple-prefs");
const { prefs } = simplePrefs;

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { Locale } = require("firebug.sdk/lib/core/locale.js");
const { Content } = require("firebug.sdk/lib/core/content.js");
const { Str } = require("firebug.sdk/lib/core/string.js");
const { Options } = require("firebug.sdk/lib/core/options.js");

// Constants
const { InspectorService } = require("./inspector-service.js");

const nsIFilePicker = Ci.nsIFilePicker;
const WINDOW_TYPE = "RDPInspectorConsole";
const INSPECTOR_XUL_URL = "chrome://rdpinspector/content/inspector-window.xul";

/**
 * xxxHonza: TODO docs
 */
const InspectorWindow = Class(
/** @lends InspectorWindow */
{
  // Initialization

  initialize: function(toolboxOverlay, inspectorWindowName) {
    this.toolboxOverlay = toolboxOverlay;
    this.inspectorWindowName = inspectorWindowName;
    this.toolbox = toolboxOverlay.toolbox;

    // Prefs changes
    this.onPrefsChanged = this.onPrefsChanged.bind(this);

    // Transport Protocol
    this.onSendPacket = this.onSendPacket.bind(this);
    this.onReceivePacket = this.onReceivePacket.bind(this);

    // DOM Events
    this.onClose = this.onClose.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onFrameContentLoaded = this.onFrameContentLoaded.bind(this);

    // Message Manager
    this.onContentMessage = this.onContentMessage.bind(this);

    this.pause = false;
  },

  destroy: function() {
    this.toolboxOverlay.removeTransportListener(this);

    if (this.win) {
      this.win.close();
    }
  },

  toggle: function() {
    Trace.sysout("InspectorWindow.toggle;", arguments);

    let win = getMostRecentWindow(WINDOW_TYPE);

    // If the Inspector is already opened, just reuse the window.
    if (win) {
      win.focus();
      return win;
    }

    let url = INSPECTOR_XUL_URL;
    return this.open("rdp-inspector", url, [{
      inspectorWindowName: this.inspectorWindowName
    }]);
  },

  open: function(windowType, url, params) {
    Trace.sysout("InspectorWindow.open;", arguments);

    // Open RDP Inspector console window. The
    this.win = openDialog({
      url: url,
      name: Locale.$STR("rdpInspector.startButton.title"),
      args: params,
      features: "chrome,resizable,scrollbars=auto,minimizable,dialog=no"
    });

    // Hook events
    Events.on(this.win, "load", this.onLoad);
    Events.on(this.win, "close", this.onClose);

    return this.win;
  },

  // Console Events

  onLoad: function(event) {
    Trace.sysout("InspectorWindow.onLoad; ", event);

    let frame = this.getFrame();
    frame.setAttribute("src", self.data.url("inspector/main.html"));

    // Load content script and handle messages sent from it.
    let { messageManager } = frame.frameLoader;
    if (messageManager) {
      let url = self.data.url("inspector/frame-script.js");
      messageManager.loadFrameScript(url, false);
      messageManager.addMessageListener("message", this.onContentMessage);
    }

    Events.once(frame, "DOMContentLoaded", this.onFrameContentLoaded);
  },

  onFrameContentLoaded: function(event) {
    Trace.sysout("InspectorWindow.onFrameContentLoaded; ", event);

    let contentWindow = this.getContentWindow();

    let { Trace: contentTrace } = FBTrace.get("CONTENT");
    Content.exportIntoContentScope(contentWindow, Str, "Str");
    Content.exportIntoContentScope(contentWindow, Locale, "Locale");
    Content.exportIntoContentScope(contentWindow, contentTrace, "Trace");
    Content.exportIntoContentScope(contentWindow, TraceError, "TraceError");
    Content.exportIntoContentScope(contentWindow, Options, "Options");
  },

  onWindowInitialized: function(event) {
    Trace.sysout("InspectorWindow.onWindowInitialized; ", event);

    // Get cache before registering the listener.
    let cache = this.toolboxOverlay.getPacketCache();
    Trace.sysout("InspectorWindow.onWindowInitialized; packetCache:", cache);

    // Start listening to RDP traffic.
    this.toolboxOverlay.addTransportListener(this);

    // Make sure packets sent at the very beginning are also displayed.
    this.postCommand("init-packet-list", this.stringifyCache(cache));

    // Make sure options are set at the very beginning
    this.onPrefsChanged();

    simplePrefs.on("showInlineDetails", this.onPrefsChanged);
    simplePrefs.on("packetCacheEnabled", this.onPrefsChanged);

    InspectorService.getInspectorClients(this.toolbox).then(clients => {
      // install inspector actors
      this.inspectorActorClients = clients;
      // get the actors and factories info from the inspector actors
      // for the first time
      this.onGetRDPActors();
    });
  },

  onPrefsChanged: function() {
    this.postCommand("init-options", JSON.stringify({
      showInlineDetails: prefs.showInlineDetails,
      packetCacheEnabled: prefs.packetCacheEnabled
    }));
  },

  onOptionsToggle: function(args) {
    let { name } = args;

    switch (name) {
      case "showInlineDetails":
      case "packetCacheEnabled":
        prefs[name] = !prefs[name];
        break;
      default:
        throw Error("Unsupported preference name: " + name);
    }
  },

  onViewSource: function(sourceLink) {
    Trace.sysout("InspectorWindow.onViewSource;", sourceLink);

    var url = sourceLink.url;
    var urls = url.split("->");
    if (urls.length > 1) {
      url = urls[urls.length - 1].trim();
    }

    // xxxHonza: could we open the debugger?
    this.win.gViewSourceUtils.viewSource({
      URL: url,
      lineNumber: sourceLink.lineNumber
    });
  },

  stringifyCache: function(cache) {
    try {
      return JSON.stringify(cache);
    } catch (err) {
      Trace.sysout("InspectorWindow.stringifyCache; ERROR " + err, err);
      Trace.sysout("InspectorWindow.stringifyCache; cache", cache);
    }

    // xxxHonza: display an error in the UI (in the packet list)

    return "{}";
  },

  onInjectRDPPacket: function(packet) {
    this.toolbox.target.client._transport.send(packet);
  },

  onGetRDPActors: function() {
    if (!this.inspectorActorClients) {
      return;
    }

    var gotGlobalActors = this.inspectorActorClients.global.getActors();
    var gotTabActors = this.inspectorActorClients.tab.getActors();

    all([gotGlobalActors, gotTabActors]).then((results) => {
      this.postCommand("got-rdp-actors", JSON.stringify({
        global: results[0],
        tab: results[1]
      }));
    });
  },

  onPause: function(pause) {
    this.pause = pause;
  },

  onClose: function(event) {
    Trace.sysout("InspectorWindow.onClose; " + event, arguments);

    this.toolboxOverlay.removeTransportListener(this);

    this.win = null;
  },

  onLoadFromFile: function() {
    let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(this.win, null, nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll);
    fp.filterIndex = 0;

    let rv = fp.show();
    if (rv !== nsIFilePicker.returnCancel) {
      let inputStream = Cc["@mozilla.org/network/file-input-stream;1"]
        .createInstance(Ci.nsIFileInputStream);
      let cstream = Cc["@mozilla.org/intl/converter-input-stream;1"]
        .createInstance(Ci.nsIConverterInputStream);

      // Initialize input stream (read, create)
      let permFlags = parseInt("0666", 8);
      inputStream.init(fp.file, 0x01 | 0x08, permFlags, 0);
      cstream.init(inputStream, "UTF-8", 0, 0);

      // Load JSON data
      let json = "";
      let data = {};
      while (cstream.readString(-1, data) != 0) {
        json += data.value;
      }
      inputStream.close();

      this.postCommand("loaded-packet-list-file", json);
    }
  },

  onSaveToFile: function(args) {
    let { data, filename } = args;

    let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(this.win, null, nsIFilePicker.modeSave);
    fp.appendFilters(nsIFilePicker.filterAll);
    fp.filterIndex = 0;
    fp.defaultString = filename;

    let rv = fp.show();
    if (rv !== nsIFilePicker.returnCancel) {
      // Initialize output stream.
      let outputStream = Cc["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Ci.nsIFileOutputStream);

      // write, create, truncate
      let permFlags = parseInt("0666", 8);
      outputStream.init(fp.file, 0x02 | 0x08 | 0x20, permFlags, 0);

      // Store JSON
      outputStream.write(data, data.length);
      outputStream.close();
    }
  },

  // Transport Listener

  onSendPacket: function(packet) {
    if (this.pause) {
      return;
    }

    this.postCommand("send-packet", JSON.stringify(packet));
  },

  onReceivePacket: function(packet) {
    if (this.pause) {
      return;
    }

    this.postCommand("receive-packet", JSON.stringify(packet));
  },

  // Content <-> Chrome Communication

  /**
   * Handle messages coming from the content scope (from panel's iframe).
   */
  onContentMessage: function(msg) {
    Trace.sysout("InspectorWindow.onContentMessage; " + msg.data.type, msg);

    let event = msg.data;
    let args = event.args;

    switch (event.type) {
    case "inject-rdp-packet":
      this.onInjectRDPPacket(args);
      break;

    case "get-rdp-actors":
      this.onGetRDPActors();
      break;

    case "find":
      this.win.gFindBar.onFindCommand();
      break;

    case "initialized":
      this.onWindowInitialized();
      break;

    case "pause":
      this.onPause(args);
      break;

    case "load-from-file":
      this.onLoadFromFile(args);
      break;

    case "save-to-file":
      this.onSaveToFile(args);
      break;

    case "options-toggle":
      this.onOptionsToggle(args);
      break;

    case "view-source":
      this.onViewSource(args);
      break;
    }
  },

  postContentMessage: function(id, data) {
    let frame = this.getFrame();
    let { messageManager } = frame.frameLoader;
    messageManager.sendAsyncMessage("rdpinspector/event/message", {
      type: id,
      bubbles: false,
      cancelable: false,
      data: data,
      origin: this.url
    });
  },

  postCommand: function(type, data) {
    let contentWindow = this.getContentWindow();
    if (!contentWindow) {
      TraceError.sysout("InspectorWindow.postCommand; ERROR no window for: " +
        type, data);
      return;
    }

    var event = new contentWindow.MessageEvent(type, {
      bubbles: true,
      cancelable: true,
      data: data
    });

    contentWindow.dispatchEvent(event);
  },

  getContentWindow: function() {
    let frame = this.getFrame();
    if (!frame) {
      return null;
    }

    return frame && frame.contentWindow;
  },

  getFrame: function() {
    if (!this.win) {
      return null;
    }

    return this.win.document.getElementById("contentFrame");
  }
});

// Exports from this module
exports.InspectorWindow = InspectorWindow;
