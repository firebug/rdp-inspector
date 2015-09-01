/* See license.txt for terms of usage */

define(function(require, exports/*, module*/) {

"use strict";

if (["http:", "https:", "file:"].indexOf(window.location.protocol) >= 0) {
    // NOTE: add RDPi injected APIs shims, to be able to run the React UI in a tab
    exports.Locale = window.Locale = {
      $STR: function(s) { return s; }
    };

    exports.Options = window.Options = {
      getPref: function(key) {
        /* eslint no-console: 0 */
        switch(key) {
        case "extensions.rdpinspector.packetLimit":
          return 100;
        default:
          throw Error("UNKNOWN Option.getPref: " + key);
        }
      }
    };

    exports.Str = window.Str = {
      formatSize: function(str) { return str; }
    };

    exports.Trace = window.Trace = {
      sysout: function(...args) {
        console.log.apply(console, args);
      }
    };

    exports.postChromeMessage = window.postChromeMessage = function() {
      console.log("POST CHROME MESSAGE", arguments);
    };
} else {
  /* globals Str, Locale, Options, Trace, postChromeMessage */
  exports.Str = Str;
  exports.Locale = Locale;
  exports.Options = Options;
  exports.Trace = Trace;

  exports.postChromeMessage = postChromeMessage;
}

});
