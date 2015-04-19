/* See license.txt for terms of usage */

define(function(require, exports, module) {

/**
 * Helper object for drag-and-drop. It's used e.g. by the {@Splitter}
 * template. This object registers mouse event listeners and executes
 * provided callbacks - typically an object/component that implements
 * drag and drop features.
 */
function Tracker(handle, callbacks) {
  this.element = handle;
  this.handle = handle;
  this.callbacks = callbacks;

  this.cursorStartPos = null;
  this.cursorLastPos = null;
  //this.elementStartPos = null;
  this.dragging = false;

  // Start listening
  this.onDragStart = this.onDragStart.bind(this);
  this.onDragOver = this.onDragOver.bind(this);
  this.onDrop = this.onDrop.bind( this);

  this.element.addEventListener("mousedown", this.onDragStart, false);
  this.active = true;
}

Tracker.prototype =
/** @lends Tracker */
{
  onDragStart: function(event) {
    if (this.dragging) {
      return;
    }

    if (this.callbacks.onDragStart) {
      this.callbacks.onDragStart(this);
    }

    this.dragging = true;
    this.cursorStartPos = absoluteCursorPosition(event);
    this.cursorLastPos = this.cursorStartPos;
    //this.elementStartPos = new Position(
    //    parseInt(this.element.style.left),
    //    parseInt(this.element.style.top));

    this.element.ownerDocument.addEventListener("mousemove",
      this.onDragOver, false);

    this.element.ownerDocument.addEventListener("mouseup",
      this.onDrop, false);

    cancelEvent(event);
  },

  onDragOver: function(event) {
    if (!this.dragging) {
      return;
    }

    cancelEvent(event);

    var newPos = absoluteCursorPosition(event);
    //newPos = newPos.Add(this.elementStartPos);
    newPos = newPos.Subtract(this.cursorStartPos);
    //newPos = newPos.Bound(lowerBound, upperBound);
    //newPos.Apply(this.element);

    // Only fire event if the position has beeb changed.
    if (this.cursorLastPos.x == newPos.x && this.cursorLastPos.y == newPos.y) {
      return;
    }

    this.cursorLastPos = newPos;

    if (this.callbacks.onDragOver != null) {
      this.callbacks.onDragOver(newPos, this);
    }
  },

  onDrop: function(event) {
    if (!this.dragging) {
      return;
    }

    cancelEvent(event);

    this.dragStop();
  },

  dragStop: function() {
    if (!this.dragging) {
      return;
    }

    this.element.ownerDocument.removeEventListener("mousemove",
      this.onDragOver, false);
    this.element.ownerDocument.removeEventListener("mouseup",
      this.onDrop, false);

    this.cursorStartPos = null;
    this.cursorLastPos = null;
    //this.elementStartPos = null;

    if (this.callbacks.onDrop != null) {
      this.callbacks.onDrop(this);
    }

    this.dragging = false;
  },

  destroy: function() {
    this.element.removeEventListener("mousedown",
      this.onDragStart, false);

    this.active = false;

    if (this.dragging) {
      this.dragStop();
    }
  }
};

/**
 * This object is represents mouse position and provides
 * related API for its manipulation.
 */
function Position(x, y)
/** @lends Position */
{
  this.x = x;
  this.y = y;

  this.Add = function(val) {
    var newPos = new Position(this.x, this.y);
    if (val != null) {
      if (!isNaN(val.x)) {
        newPos.x += val.x;
      }

      if (!isNaN(val.y)) {
        newPos.y += val.y;
      }
    }
    return newPos;
  };

  this.Subtract = function(val) {
    var newPos = new Position(this.x, this.y);
    if (val != null) {
      if (!isNaN(val.x)) {
        newPos.x -= val.x;
      }

      if (!isNaN(val.y)) {
        newPos.y -= val.y;
      }
    }
    return newPos;
  };

  this.Bound = function(lower, upper) {
    var newPos = this.Max(lower);
    return newPos.Min(upper);
  };

  this.Check = function() {
    var newPos = new Position(this.x, this.y);
    if (isNaN(newPos.x)) {
      newPos.x = 0;
    }

    if (isNaN(newPos.y)) {
      newPos.y = 0;
    }

    return newPos;
  };

  this.Apply = function(element) {
    if (typeof(element) == "string") {
      element = document.getElementById(element);
    }

    if (!element) {
      return;
    }

    if (!isNaN(this.x)) {
      element.style.left = this.x + "px";
    }

    if (!isNaN(this.y)) {
      element.style.top = this.y + "px";
    }
  };
}

function absoluteCursorPosition(e) {
  if (isNaN(window.scrollX)) {
    return new Position(e.clientX +
      document.documentElement.scrollLeft +
      document.body.scrollLeft, e.clientY +
      document.documentElement.scrollTop +
      document.body.scrollTop);
  }
  else {
    return new Position(e.clientX + window.scrollX,
      e.clientY + window.scrollY);
  }
}

function cancelEvent(event) {
  event.stopPropagation();
  event.preventDefault();
}

// Exports from this module
exports.Tracker = Tracker;
});
