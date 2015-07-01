/* See license.txt for terms of usage */

/* globals requirejs */

// RequireJS configuration
require.config({
  baseUrl: ".",
  paths: {
    "jquery": "../lib/jquery/jquery",
    "react": "../lib/react/react",
    "bootstrap": "../lib/bootstrap/js/bootstrap",
    "immutable": "../lib/immutable/immutable",
    "react-bootstrap": "../lib/react-bootstrap/react-bootstrap",
    "reps": "../../node_modules/firebug.sdk/lib/reps"
  }
});

// Load the main panel module
requirejs(["main"]);
