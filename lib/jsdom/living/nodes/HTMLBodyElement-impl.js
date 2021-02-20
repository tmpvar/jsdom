"use strict";
const { mixin } = require("../../utils.js");
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const WindowEventHandlersImpl = require("./WindowEventHandlers-impl.js").implementation;

class HTMLBodyElementImpl extends HTMLElementImpl {
  constructor(...args) {
    super(...args);
    this._proxyWindowEventsToWindow();
  }
}

mixin(HTMLBodyElementImpl.prototype, WindowEventHandlersImpl.prototype);

module.exports = {
  implementation: HTMLBodyElementImpl
};
