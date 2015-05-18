define(function(require, exports, module) {
  "use strict";

  var React = require("react");
  var { TestUtils } = React.addons;

  module.exports = {
    toBeFoundInReactTree: () => {
      return {
        compare: (component, tree, length) => {
          var message = "React Component '" + component.displayName + "'" +
            " not found in the rendered tree";

          var instances = TestUtils.scryRenderedComponentsWithType(tree, component);

          return {
            pass: length ?
              instances.length === length : instances.length > 0,
            message: message
          };
        }
      };
    }
  };
});
