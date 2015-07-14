"use strict";

const { InspectorService } = require("../lib/inspector-service");

const { Cu } = require("chrome");
const { getMostRecentBrowserWindow } = require("sdk/window/utils");

// DevTools
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

function showToolbox(toolId) {
  let browser = getMostRecentBrowserWindow();
  let tab = browser.gBrowser.mCurrentTab;
  let target = devtools.TargetFactory.forTab(tab);
  return gDevTools.showToolbox(target, toolId);
}

function formatException(e) {
  return `\n\t${e.fileName}:${e.lineNumber}\n\t${e}`;
}

exports["test InspectorService"] = function(assert, done) {
  showToolbox("webconsole").then((toolbox) => {
    assert.ok(toolbox, "toolbox should be defined");

    InspectorService.getInspectorClients(toolbox).then((inspectorClients) => {
      assert.ok(inspectorClients, "inspectorClients should be defined");
      assert.deepEqual(Object.keys(inspectorClients), ["global", "tab"],
                        "global and tab keys should be defined");
      let { global, tab } = inspectorClients;
      assert.equal(typeof global.getActors, "function", "global.getActors function is defined");
      assert.equal(typeof tab.getActors, "function", "tab.getActors function is defined");

      Promise.all([global.getActors(), tab.getActors()]).then(([tabActors, globalActors]) => {
        const EXPECTED_ACTOR_KEYS = ["actorPool", "extraPools", "factories", "from"];

        assert.deepEqual(Object.keys(globalActors), EXPECTED_ACTOR_KEYS, "globalActors should have the expected attributes");
        assert.deepEqual(Object.keys(tabActors), EXPECTED_ACTOR_KEYS, "tabActors should have the expected attributes");

        done();
      }).catch((e) => {
        assert.fail(`Exception catched during getActors: ${formatException(e)}`);
        done();
      });
    }).catch((e) => {
      assert.fail(`Exception catched during getInspectorClients: ${formatException(e)}`);
      done();
    });
  }).catch((e) => {
    assert.fail(`Exception catched during showToolbox: ${formatException(e)}`);
    done();
  });
};

require("sdk/test").run(exports);
