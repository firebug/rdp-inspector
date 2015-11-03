/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var React = require("react");
var ReactDOM = require("react-dom");
/*var { TestUtils } = React.addons;*/

const { ReactLazyFactories } = require("shared/react-helpers");
const { Provider } = ReactLazyFactories(require("react-redux"));
const { App } = ReactLazyFactories(require("inspector/containers/app"));

var { PacketsSummaryComponent } = require("inspector/components/packets-summary");
var { PacketComponent } = require("inspector/components/packet");
var { PacketsPanelComponent } = require("inspector/components/packets-panel");
var { ActorsPanelComponent } = require("inspector/components/actors-panel");

var { RDPInspectorView } = require("shared/rdp-inspector-window");

// actions & store
const store = window.store = require("inspector/store").configureStore();
const actions = require("inspector/actions/index");

const view = new RDPInspectorView({
  window, actions, store,
});

view.render = function() {
  let content = document.body;
  let provider = Provider({ store }, () => {
    return App({ view });
  });
  this.app = ReactDOM.render(provider, content);
};

view.render();

describe("MainTabbedArea React Component", function() {
  beforeAll(function () {
    jasmine.addMatchers(require("karma-tests/custom-react-matchers"));
  });

  beforeEach(function () {
    view.clear();
  });

  afterAll(function () {
    React.unmountComponentAtNode(document.body);
  });

  it("renders without errors", function() {
    //console.log("theApp", theApp, theApp.getDOMNode());
    expect(view).toBeDefined();

    expect(ReactDOM.findDOMNode(view.app)).toEqual(document.body.firstChild);
  });

  it("is composed by a PacketsPanel and an ActorsPanel", function () {
    var components = [
      PacketsPanelComponent,
      ActorsPanelComponent
    ];

    components.forEach((Component) => {
      expect(Component).toBeFoundInReactTree(view.app, 1);
    });
  });

  it("renders a PacketsSummary on PacketsStore.appendSummary", function () {
    view.appendSummary();

    expect(PacketsSummaryComponent).toBeFoundInReactTree(view.app, 1);
  });

  it("renders a Packet on PacketsStore.sendPacket", function () {
    var packet = JSON.stringify({
      to: "root",
      type: "requestTypes"
    });

    view.onSendPacket({
      data: JSON.stringify({
        packet: packet,
        stack: []
      })
    });

    // NOTE: packets-store refresh the app every 200 ms
    //packetsStore.refreshPackets(true);

    expect(PacketComponent).toBeFoundInReactTree(view.app, 1);
  });
});
});
