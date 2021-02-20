"use strict";

const HTMLMediaElementImpl = require("./HTMLMediaElement-impl.js").implementation;

class HTMLVideoElementImpl extends HTMLMediaElementImpl {
  get videoWidth() {
    return 0;
  }

  get videoHeight() {
    return 0;
  }
}

module.exports = {
  implementation: HTMLVideoElementImpl
};
