"use strict";
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLEmbedElementImpl extends HTMLElementImpl {}

module.exports = {
  implementation: HTMLEmbedElementImpl
};
