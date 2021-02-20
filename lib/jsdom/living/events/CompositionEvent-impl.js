"use strict";

const UIEventImpl = require("./UIEvent-impl.js").implementation;
const CompositionEventInit = require("../generated/CompositionEventInit.js");

class CompositionEventImpl extends UIEventImpl {
  initCompositionEvent(type, bubbles, cancelable, view, data) {
    if (this._dispatchFlag) {
      return;
    }

    this.initUIEvent(type, bubbles, cancelable, view, 0);
    this.data = data;
  }
}
CompositionEventImpl.defaultInit = CompositionEventInit.convert(undefined);

module.exports = {
  implementation: CompositionEventImpl
};
