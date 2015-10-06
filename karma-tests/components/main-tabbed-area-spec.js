/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
/*var { TestUtils } = React.addons;*/

// Fake actions singleton
var actions = {};

var { MainTabbedArea: mainTabbedArea } = require("inspector/components/main-tabbed-area");
var { PacketsSummaryComponent } = require("inspector/components/packets-summary");
var { PacketComponent } = require("inspector/components/packet");
var { PacketsPanelComponent } = require("inspector/components/packets-panel");
var { ActorsPanelComponent } = require("inspector/components/actors-panel");

var { PacketsStore } = require("inspector/packets-store");

var theApp, packetsStore;
theApp = React.render(mainTabbedArea({ actions: actions }), document.body);
packetsStore = new PacketsStore(window, theApp);

describe("MainTabbedArea React Component", function() {
  beforeAll(function () {
    jasmine.addMatchers(require("karma-tests/custom-react-matchers"));
  });

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
    var components = [
      PacketsPanelComponent,
      ActorsPanelComponent
    ];

    components.forEach((Component) => {
      expect(Component).toBeFoundInReactTree(theApp, 1);
    });
  });

  it("renders a PacketsSummary on PacketsStore.appendSummary", function () {
    packetsStore.appendSummary();

    expect(PacketsSummaryComponent).toBeFoundInReactTree(theApp, 1);
  });

  it("renders a Packet on PacketsStore.sendPacket", function () {
    var packet = JSON.stringify({
      to: "root",
      type: "requestTypes"
    });

    packetsStore.onSendPacket({
      data: JSON.stringify({
        packet: packet,
        stack: []
      })
    });

    // NOTE: packets-store refresh the app every 200 ms
    packetsStore.refreshPackets(true);

    expect(PacketComponent).toBeFoundInReactTree(theApp, 1);
  });
});
});
