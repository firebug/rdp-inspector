/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var { TestUtils } = React.addons;

var { PacketsSidebar } = require("inspector/components/packets-sidebar");
var ReactMatchers = require("karma-tests/custom-react-matchers");

describe("PacketsSidebar", () => {
  beforeAll(() => {
    jasmine.addMatchers(ReactMatchers);
  });

  describe("active sidebar auto switch", () => {
    it("switch to the editor tab on 'rdpinspector:switchToPacketEditorTab' DOM event", () => {
      var packetData = {
        "type": "fakeSentPacket",
        "to": "server1.conn1.child1/fakeActor2"
      };
      var data = {
        type: "send",
        id: 1,
        time: new Date("2015-06-09T16:48:50.162Z"),
        packet: packetData,
        size: JSON.stringify(packetData).length
      };

      var actions = {};

      var packetsSidebar = TestUtils.renderIntoDocument(PacketsSidebar({
        selectedPacket: null,
        editedPacket: data,
        actions: actions
      }));

      expect(packetsSidebar.state.activeKey).toEqual(1);

      window.dispatchEvent(new CustomEvent("rdpinspector:switchToPacketEditorTab"));

      expect(packetsSidebar.state.activeKey).toEqual(2);
    });
  });

});

});
