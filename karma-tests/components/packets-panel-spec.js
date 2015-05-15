/* eslint-env jasmine */

define(function (require) {
"use strict";

var React = require("react");
var { TestUtils } = React.addons;

var { PacketsPanel } = require("components/packets-panel");
var { PacketsToolbarComponent } = require("components/packets-toolbar");
var { PacketListComponent } = require("components/packet-list");
var { PacketsSidebarComponent } = require("components/packets-sidebar");

var packetsPanel = TestUtils.renderIntoDocument(PacketsPanel({}));

var ReactMatchers = require("karma-tests/custom-react-matchers");

describe("PacketsPanel", () => {
  beforeAll(() => {
    jasmine.addMatchers(ReactMatchers);
  });

  it("renders without errors", () => {
    expect(packetsPanel).toBeDefined();

    expect(packetsPanel.getDOMNode()).toBeDefined();
  });

  it("contains a PacketsToolbar, a PacketsList and a PacketsSidebar", () => {
    var components = [
      PacketsToolbarComponent,
      PacketListComponent,
      PacketsSidebarComponent
    ];

    components.forEach((component) => {
      expect(component).toBeFoundInReactTree(packetsPanel, 1);
    });
  });

});
});
