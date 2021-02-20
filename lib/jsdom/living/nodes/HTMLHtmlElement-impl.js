"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLHtmlElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLHtmlElementImpl
};
