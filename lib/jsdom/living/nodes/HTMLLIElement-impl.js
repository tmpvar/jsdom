"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLLIElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLLIElementImpl
};
