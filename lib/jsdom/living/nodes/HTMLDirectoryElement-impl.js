"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLDirectoryElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLDirectoryElementImpl
};
