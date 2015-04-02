/* See license.txt for terms of usage */

define(function(require, exports, module) {

/**
 * TODO docs
 */
function Resizer(win, app) {
  this.win = win;
  this.app = app;
  this.win.addEventListener("resize", this.onResize.bind(this));

  // Initialize content size
  this.onResize();
}

Resizer.prototype =
/** @lends Resizer */
{
  onResize: function() {
    var doc = this.win.document;
    doc.body.style.height = this.win.innerHeight + "px";
    doc.body.style.width = this.win.innerWidth + "px";
  },
}

// Exports from this module
exports.Resizer = Resizer;
});
