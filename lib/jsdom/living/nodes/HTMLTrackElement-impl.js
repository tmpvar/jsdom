"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;

class HTMLTrackElementImpl extends HTMLElementImpl {
  get readyState() {
    return 0;
  }
}

module.exports = {
  implementation: HTMLTrackElementImpl
};
