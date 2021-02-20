"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLUnknownElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLUnknownElementImpl
};
