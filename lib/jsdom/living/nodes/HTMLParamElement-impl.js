"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLParamElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLParamElementImpl
};
