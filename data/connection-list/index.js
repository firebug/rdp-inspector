/* See license.txt for terms of usage */

define(function(require/*, exports, module*/) {

"use strict";

// React
var React = require("react");

// RDP Inspector
const { Resizer } = require("shared/resizer");
const { ReactLazyFactories } = require("shared/react-helpers");
const { RDPConnectionList } = require("shared/rdp-inspector-window");

// generate React Factories
const { Provider } = ReactLazyFactories(require("react-redux"));
const { MainPanel } = ReactLazyFactories(require("./containers/main-panel"));

// actions & store
const actions = require("./actions");
const store = require("./store").configureStore();

function render() {
  let content = document.querySelector("#content");
  let provider = Provider({ store }, () => {
    return MainPanel({
      onConnectionClick: (conn) => {
        RDPConnectionList.openRDPInspectorWindow(conn);
      }
    });
  });
  let app = React.render(provider, content);
  return new Resizer(window, app);
}

function updateConnections() {
  let connections = RDPConnectionList.getConnectionsInfo();
  store.dispatch(actions.setConnections(connections));
}

render();
updateConnections();
RDPConnectionList.onConnectionsUpdated.addListener(updateConnections);

});
