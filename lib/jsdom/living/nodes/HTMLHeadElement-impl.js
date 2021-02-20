"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLHeadElementImpl extends HTMLElementImpl { }

module.exports = {
  implementation: HTMLHeadElementImpl
};
