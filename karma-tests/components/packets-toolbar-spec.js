/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var { TestUtils } = React.addons;

var { PacketsToolbar } = require("components/packets-toolbar");
var {
  DropdownButton,
  MenuItem
} = require("react-bootstrap");

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
    var instances = TestUtils.scryRenderedComponentsWithType(packetsToolbar,
        DropdownButton);

    var fileDropdowns = instances.filter((instance) => {
      return instance.props.title === "File";
    });
    expect(instances.length).toBeGreaterThan(0);
    expect(fileDropdowns.length).toBe(1);
  });

  describe("its File DropdownButton Menu", () => {
    var fileMenu, menuItemsByLabel;
    // spy actions that should be called
    var actions = {
      loadPacketsFromFile: jasmine.createSpy("loadPacketsFromFile"),
      savePacketsToFile: jasmine.createSpy("savePacketsToFile")
    };

    beforeAll(() => {
      packetsToolbar = TestUtils.renderIntoDocument(PacketsToolbar({
        actions: actions
      }));

      // get a reference to the file menu
      fileMenu = TestUtils.scryRenderedComponentsWithType(
        packetsToolbar, DropdownButton
      ).filter((instance) => {
        return instance.props.title === "File";
      })[0];

      // collect menuItems in a map indexed by label
      menuItemsByLabel = TestUtils.scryRenderedComponentsWithType(
        fileMenu, MenuItem
      ).reduce((acc, instance) => {
        var { children } = instance.props;
        acc[children] = !acc[children] ?
          [ instance ] :
          acc[children].push(instance);
        return acc;
      }, {});
    });

    it("contains a Load and Save MenuItems", () => {
      // load and save menuitems should be defined
      expect(menuItemsByLabel.Load).toBeDefined();
      expect(menuItemsByLabel.Save).toBeDefined();
      // they should not have any duplicates
      expect(menuItemsByLabel.Load.length).toBe(1);
      expect(menuItemsByLabel.Save.length).toBe(1);
    });

    it("calls props.actions.loadPacketsFromFile on Load clicks", () => {
      var node = React.findDOMNode(menuItemsByLabel.Load[0]);
      TestUtils.Simulate.click(node);
      expect(actions.loadPacketsFromFile).toHaveBeenCalled();
    });

    it("calls props.actions.savePacketsFromFile on Save clicks", () => {
      var node = React.findDOMNode(menuItemsByLabel.Save[0]);
      TestUtils.Simulate.click(node);
      expect(actions.savePacketsToFile).toHaveBeenCalled();
    });
  });

});
});
