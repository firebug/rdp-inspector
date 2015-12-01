/* See license.txt for terms of usage */

define(function(require/*, exports, module*/) {

"use strict";

// ReactJS
var ReactDOM = require("react-dom");

// RDP Inspector
const { Resizer } = require("shared/resizer");
const { ReactLazyFactories } = require("shared/react-helpers");

// generate React Factories
const { Provider } = ReactLazyFactories(require("react-redux"));
const { App } = ReactLazyFactories(require("./containers/app"));

// Reps
require("./components/stack-frame-rep");

// Search
var { Search } = require("./search");

// RDP Window injected APIs
var { postChromeMessage, RDPInspectorView } = require("shared/rdp-inspector-window");

// actions & store
const store = window.store = require("./store").configureStore();
const actions = require("./actions/index.js");

const view = new RDPInspectorView({
  window, actions, store,
});

/**
 * Render the main application component. It's the main tab bar displayed
 * at the top of the window. This component also represents ReactJS root.
 */
view.render = function() {
  let content = document.querySelector("#content");
  let provider = Provider({ store }, App({ view }));
  let app = ReactDOM.render(provider, content);

  /* eslint-disable no-new */
  new Resizer(window, app);
  new Search(window, app);
  /* eslint-enable */
};

view.render();
// Send notification about initialization being done.
postChromeMessage("initialized");

// End of main.js
});
