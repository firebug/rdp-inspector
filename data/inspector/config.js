/* See license.txt for terms of usage */

/* globals requirejs */

// RequireJS configuration
require.config({
  baseUrl: ".",
  scriptType: "application/javascript;version=1.8",
  paths: {
    "shared": "../shared",
    "jquery": "../lib/jquery/jquery",
    "react": "../lib/react/react",
    "bootstrap": "../lib/bootstrap/js/bootstrap",
    "immutable": "../lib/immutable/immutable",
    "react-bootstrap": "../lib/react-bootstrap/react-bootstrap",
    "reps": "../../node_modules/firebug.sdk/lib/reps",
    "redux": "../lib/redux/redux",
    "react-redux": "../lib/redux/react-redux",
  }
});

// Load the main panel module
requirejs(["main"]);
