"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLMetaElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLMetaElementImpl
};
