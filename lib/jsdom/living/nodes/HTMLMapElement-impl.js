"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLMapElementImpl extends HTMLElementImpl {
  get areas() {
    return this.getElementsByTagName("AREA");
  }
}

module.exports = {
  implementation: HTMLMapElementImpl
};
