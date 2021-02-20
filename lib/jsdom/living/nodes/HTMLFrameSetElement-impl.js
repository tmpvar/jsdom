"use strict";
const { mixin } = require("../../utils.js");
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const WindowEventHandlersImpl = require("./WindowEventHandlers-impl.js").implementation;

class HTMLFrameSetElementImpl extends HTMLElementImpl {
  constructor(...args) {
    super(...args);
    this._proxyWindowEventsToWindow();
  }
}

mixin(HTMLFrameSetElementImpl.prototype, WindowEventHandlersImpl.prototype);

module.exports = {
  implementation: HTMLFrameSetElementImpl
};
