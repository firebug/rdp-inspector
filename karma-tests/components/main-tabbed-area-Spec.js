/* eslint-env jasmine */
/* global console, define */
/* eslint no-console:0 */

define(function (require) {
  "use strict";

  var React = require("react");
  var { TestUtils } = React.addons;

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

  var { MainTabbedArea: mainTabbedArea } = require("components/main-tabbed-area");
  var { PacketsSummaryComponent } = require("components/packets-summary");
  var { PacketComponent } = require("components/packet");
  var { PacketsPanelComponent } = require("components/packets-panel");
  var { ActorsPanelComponent } = require("components/actors-panel");

  var { PacketsStore } = require("packets-store");

  var theApp, packetsStore;
  theApp = React.render(mainTabbedArea({ actions: actions }), document.body);
  packetsStore = new PacketsStore(window, theApp);

  describe("MainTabbedArea React Component", function() {
    beforeEach(function () {
      packetsStore.clear();
    });

    afterAll(function () {
      React.unmountComponentAtNode(document.body);
    });

    it("renders without errors", function() {
      //console.log("theApp", theApp, theApp.getDOMNode());
      expect(theApp).toBeDefined();

      expect(theApp.getDOMNode()).toEqual(document.body.firstChild);
    });

    it("is composed by a PacketsPanel and an ActorsPanel", function () {
      var packetsPanels = TestUtils.scryRenderedComponentsWithType(
        theApp, PacketsPanelComponent
      );
      expect(packetsPanels.length).toBe(1);

      var actorsPanels = TestUtils.scryRenderedComponentsWithType(
        theApp, ActorsPanelComponent
      );
      expect(actorsPanels.length).toBe(1);
    });

    it("renders a PacketsSummary on PacketsStore.appendSummary", function () {
      packetsStore.appendSummary();

      var summaries = TestUtils.scryRenderedComponentsWithType(
        theApp, PacketsSummaryComponent
      );
      expect(summaries.length).toBe(1);
    });

    it("renders a Packet on PacketsStore.sendPacket", function () {
      packetsStore.onSendPacket({
        data: JSON.stringify({
          to: "root",
          type: "requestTypes"
        })
      });

      // NOTE: packets-store refresh the app every 200 ms
      packetsStore.refreshPackets(true);

      var packets = TestUtils.scryRenderedComponentsWithType(
        theApp, PacketComponent
      );
      expect(packets.length).toBe(1);
    });
  });
});
