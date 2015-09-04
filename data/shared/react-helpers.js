/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

const React = require("react");

exports.ReactLazyFactories = (reactElementsSource) => {
  return new Proxy({}, {
    get(target, name) {
      if ( !(name in reactElementsSource) ) {
        throw Error(`ReactLazyFactories: ${name} not found`);
      }

      if ( !(name in target) ) {
        target[name] = React.createFactory(reactElementsSource[name]);
      }

      return target[name];
    }
  });
};

});
