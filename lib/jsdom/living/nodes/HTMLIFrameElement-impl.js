"use strict";

const HTMLFrameElementImpl = require("./HTMLFrameElement-impl.js").implementation;

class HTMLIFrameElementImpl extends HTMLFrameElementImpl { }

module.exports = {
  implementation: HTMLIFrameElementImpl
};
