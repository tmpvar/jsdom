"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLHeadingElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLHeadingElementImpl
};
