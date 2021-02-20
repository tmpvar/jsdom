"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLPreElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLPreElementImpl
};
