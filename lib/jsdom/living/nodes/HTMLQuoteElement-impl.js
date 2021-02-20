"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLQuoteElementImpl extends HTMLElementImpl {}

module.exports = {
  implementation: HTMLQuoteElementImpl
};
