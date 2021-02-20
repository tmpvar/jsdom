"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLMarqueeElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLMarqueeElementImpl
};
