"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLDivElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLDivElementImpl
};
