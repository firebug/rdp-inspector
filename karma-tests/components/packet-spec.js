/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var { TestUtils } = React.addons;

var { Packet } = require("components/packet");
const { TreeViewComponent } = require("reps/tree-view");

var ReactMatchers = require("karma-tests/custom-react-matchers");

describe("Packet", () => {
  beforeAll(() => {
    jasmine.addMatchers(ReactMatchers);
  });

  //TODO: currently skipped, until TreeView component is exported from firebug.sdk
  xit("contains a TreeView for props.data.packet only if props.showInlineDetails is true", () => {
    var packet;

    var data = {
      type: "receive",
      size: 0,
      id: 1,
      time: new Date("2015-06-09T16:48:50.162Z"),
      packet: {}
    };

    packet = TestUtils.renderIntoDocument(Packet({
      showInlineDetails: false,
      data: data
    }));

    //TODO: needs TreeView component exported from firebug.sdk
    expect(TreeViewComponent).toBeFoundInReactTree(packet, 0);

    packet = TestUtils.renderIntoDocument(Packet({
      showInlineDetails: true,
      data: data
    }));

    //TODO: needs TreeView component exported from firebug.sdk
    expect(TreeViewComponent).toBeFoundInReactTree(packet, 1);
  });

  describe("context menu actions", () => {
    it("has 'Edit and Resent' action in the sent packet's context menu", () => {
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

      var actions = {
        editPacket: jasmine.createSpy("editPacket"),
        selectPacket: jasmine.createSpy("selectPacket")
      };

      var packet = TestUtils.renderIntoDocument(Packet({
        showInlineDetails: false,
        data: data,
        actions: actions
      }));

      expect(packet.refs.contextMenu).not.toBeDefined();

      var el = React.findDOMNode(packet);
      TestUtils.Simulate.contextMenu(el);

      // right clicking a packet opens a context menu and
      // select the packet
      expect(actions.selectPacket).toHaveBeenCalled();
      expect(packet.refs.contextMenu).toBeDefined();
      expect(packet.refs.editAndResendAction).toBeDefined();

      // clicking on the 'Edit and Resend' action
      var actionEl = React.findDOMNode(packet.refs.editAndResendAction);
      TestUtils.Simulate.click(actionEl);
      expect(actions.editPacket).toHaveBeenCalled();
    });
  });

  describe("issues", () => {
    it("#44 - Long packet value breaks the view", () => {
      var data = {
        type: "receive",
        size: 0,
        id: 1,
        time: new Date("2015-06-09T16:48:50.162Z"),
        packet: {
          error: null,
          message: {
            "groupName": "",
            "columnNumber": 13,
            "lineNumber": 48,
            "workerType": "none",
            "level": "table",
            "counter": null,
            "arguments": [],
            "functionName": "onExecuteTest1"
          },
          "type": "consoleAPICall",
          "from": "server1.conn1.child1/consoleActor2"
        }
      };

      var packet = TestUtils.renderIntoDocument(Packet({
        showInlineDetails: false,
        data: data
      }));

      var el = React.findDOMNode(packet);

      expect(el).toBeDefined();

      // NOTE: prior the fix, a long "consoleAPICall" received packet
      // was wrongly turned into a "div.errorMessage"
      var errorMessage = el.querySelector(".errorMessage");
      expect(errorMessage).toEqual(null);
    });
  });

});

});
