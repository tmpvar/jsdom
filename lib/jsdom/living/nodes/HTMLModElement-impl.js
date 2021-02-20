"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLModElementImpl extends HTMLElementImpl {}

module.exports = {
  implementation: HTMLModElementImpl
};
