/* See license.txt for terms of usage */

define(function(require/*, exports, module*/) {

"use strict";

const { RDPConnectionList } = require("shared/rdp-inspector-window");
var { Resizer } = require("shared/resizer");

const { MainPanel } = require("./components/main-panel");

// ReactJS
var React = require("react");

function render() {
  let connections = RDPConnectionList.getConnectionsInfo();

  return React.render(
    React.createElement(MainPanel, {
      connections,
      onConnectionClick: (conn) => {
        RDPConnectionList.openRDPInspectorWindow(conn);
      }
    }),
    document.querySelector("#content")
  );
}

let theApp = render();
RDPConnectionList.onConnectionsUpdated.addListener(render);

/* eslint-disable no-new */
new Resizer(window, theApp);
/* eslint-enable */

});
