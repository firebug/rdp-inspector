/* eslint-env jasmine */
/* global console, define */
/* eslint no-console:0 */

define(function (require) {
"use strict";
var actions = {}

var React = require("react");
var { TestUtils } = React.addons;
var { PacketEditor } = require("components/packet-editor");
var packetEditorEl = PacketEditor({ actions: actions });

var theApp = TestUtils.renderIntoDocument(packetEditorEl);

var { ActorsStore } = require("actors-store");
var actorsStore = new ActorsStore(window, theApp);

describe("PacketEditor", function() {
  it("Should render something", function() {
    expect(theApp.refs.editor).toBeDefined();
  })
});

});
