/* See license.txt for terms of usage */
/* eslint-env jasmine */

define(function (require) {

"use strict";

var ReactDOM = require("react-dom");

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

var testContainerEl = document.querySelector("#test-container");

view.render = function() {
  let provider = Provider({ store }, App({ view }));
  this.app = ReactDOM.render(provider, testContainerEl);
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
    ReactDOM.unmountComponentAtNode(document.querySelector("#test-container"));
  });

  it("renders without errors", function() {
    expect(view).toBeDefined();

    expect(ReactDOM.findDOMNode(view.app)).toEqual(testContainerEl.firstChild);
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

    expect(PacketComponent).toBeFoundInReactTree(view.app, 1);
  });
});
});
