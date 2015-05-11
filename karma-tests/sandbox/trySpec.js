/* eslint-env jasmine */
/* global console, define */
/* eslint no-console:0 */

define(function (require) {
"use strict";

  var React = require("react");
  var { TestUtils } = React.addons;

  var { MainTabbedArea } = require("components/main-tabbed-area");
  var theAppEl = MainTabbedArea({ actions: actions });

  var theApp = React.render(theAppEl, document.body);

  var { PacketsStore } = require("packets-store");
  var packetsStore = new PacketsStore(window, theApp);

  describe("Label Test", function(){
    beforeEach(function () {
      console.log("JASMINE RUN");
      //TestUtils.renderIntoDocument(MainTabbedArea({ actions: actions }));
      packetsStore.clear();
    });

    it("Check jasmine works correctly", function () {
      packetsStore.appendSummary();
      packetsStore.onSendPacket({
        data: JSON.stringify({
          to: "root",
          type: "requestTypes"
        })
      });
      console.log("jasmine test run");
    });
  });

  var actions = {
    /**
     * Select packet and display its properties in the side bar.
     */
    selectPacket: function(packet) {
    },

    /**
     * Remove all packets from the packet list.
     */
    clear: function() {
    },

    /**
     * Open standard Firefox Find bar.
     */
    find: function() {
    },

    /**
     * Send a test packet to the debugger server.
     */
    send: function(packet) {
    },

    getActors: function() {
    },

    /**
     * Appends an info summary at the end of the list. The info
     * shows number of sent/received packets and total sent/received
     * amount of data.
     */
    appendSummary: function() {
    },

    /**
     * Show packet properties inline - directly within the packet
     * box in the packet list.
     */
    onShowInlineDetails: function() {
    },

    /**
     * Pause/unpause collecting packets
     */
    onPause: function() {
    }
  };

});
