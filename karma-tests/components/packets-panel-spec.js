/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var ReactDOM = require("react-dom");

var { TestUtils } = React.addons;

var { PacketsPanel } = require("inspector/components/packets-panel");
var { PacketsToolbarComponent } = require("inspector/components/packets-toolbar");
var { PacketListComponent } = require("inspector/components/packet-list");
var { PacketsSidebarComponent } = require("inspector/components/packets-sidebar");

var packetsPanel = TestUtils.renderIntoDocument(PacketsPanel({}));

var ReactMatchers = require("karma-tests/custom-react-matchers");

describe("PacketsPanel", () => {
  beforeAll(() => {
    jasmine.addMatchers(ReactMatchers);
  });

  it("renders without errors", () => {
    expect(packetsPanel).toBeDefined();

    expect(ReactDOM.findDOMNode(packetsPanel)).toBeDefined();
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
