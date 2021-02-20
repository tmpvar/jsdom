"use strict";

const { mixin } = require("../../utils.js");
const EventModifierMixinImpl = require("./EventModifierMixin-impl.js").implementation;
const UIEventImpl = require("./UIEvent-impl.js").implementation;

const MouseEventInit = require("../generated/MouseEventInit.js");

class MouseEventImpl extends UIEventImpl {
  initMouseEvent(
    type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY,
    ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget
  ) {
    if (this._dispatchFlag) {
      return;
    }

    this.initUIEvent(type, bubbles, cancelable, view, detail);
    this.screenX = screenX;
    this.screenY = screenY;
    this.clientX = clientX;
    this.clientY = clientY;
    this.ctrlKey = ctrlKey;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    this.metaKey = metaKey;
    this.button = button;
    this.relatedTarget = relatedTarget;
  }
}
mixin(MouseEventImpl.prototype, EventModifierMixinImpl.prototype);
MouseEventImpl.defaultInit = MouseEventInit.convert(undefined);

module.exports = {
  implementation: MouseEventImpl
};
