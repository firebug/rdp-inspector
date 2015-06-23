/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var { TestUtils } = React.addons;

var { PacketsToolbar } = require("components/packets-toolbar");

var packetsToolbar = TestUtils.renderIntoDocument(PacketsToolbar({}));

var ReactMatchers = require("karma-tests/custom-react-matchers");

describe("PacketsToolbar", () => {
  beforeAll(() => {
    jasmine.addMatchers(ReactMatchers);
  });

  it("renders without errors", () => {
    expect(packetsToolbar).toBeDefined();

    expect(packetsToolbar.getDOMNode()).toBeDefined();
  });

  it("contains a 'File' DropdownButton", () => {
    expect(packetsToolbar.refs.fileMenu).toBeDefined();
  });

  describe("File DropdownButton Menu", () => {
    // spy actions that should be called
    var actions = {
      loadPacketsFromFile: jasmine.createSpy("loadPacketsFromFile"),
      savePacketsToFile: jasmine.createSpy("savePacketsToFile")
    };

    beforeAll(() => {
      packetsToolbar = TestUtils.renderIntoDocument(PacketsToolbar({
        actions: actions
      }));
    });

    it("contains a Load and Save MenuItems", () => {
      // load and save menuitems should be defined
      expect(packetsToolbar.refs.fileLoad).toBeDefined();
      expect(packetsToolbar.refs.fileSave).toBeDefined();
    });

    it("calls props.actions.loadPacketsFromFile on Load clicks", () => {
      var node = React.findDOMNode(packetsToolbar.refs.fileLoad);
      TestUtils.Simulate.click(node);
      expect(actions.loadPacketsFromFile).toHaveBeenCalled();
    });

    it("calls props.actions.savePacketsFromFile on Save clicks", () => {
      var node = React.findDOMNode(packetsToolbar.refs.fileSave);
      TestUtils.Simulate.click(node);
      expect(actions.savePacketsToFile).toHaveBeenCalled();
    });
  });

  describe("Options DropdownButton Menu", () => {
    // spy actions that should be called
    var actions = {
      onShowInlineDetails: jasmine.createSpy("onShowInlineDetails"),
      onPacketCacheEnabled: jasmine.createSpy("onPacketCacheEnabled")
    };

    beforeAll(() => {
      packetsToolbar = TestUtils.renderIntoDocument(PacketsToolbar({
        actions: actions
      }));
    });

    it("contains a 'Show Inline Details' and 'Packets Cache' MenuItems", () => {
      // load and save menuitems should be defined
      expect(packetsToolbar.refs.optionShowInlineDetails).toBeDefined();
      expect(packetsToolbar.refs.optionCachePackets).toBeDefined();
    });

    it("calls props.actions.onShowInlineDetails on 'Show Inline Details' clicks", () => {
      var node = React.findDOMNode(packetsToolbar.refs.optionShowInlineDetails);
      TestUtils.Simulate.click(node);
      expect(actions.onShowInlineDetails).toHaveBeenCalled();
    });

    it("calls props.actions.onPacketCacheEnabled on 'Packet Cache' clicks", () => {
      var node = React.findDOMNode(packetsToolbar.refs.optionCachePackets);
      TestUtils.Simulate.click(node);
      expect(actions.onPacketCacheEnabled).toHaveBeenCalled();
    });
  });
});

});
