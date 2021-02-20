"use strict";

const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const { childTextContent } = require("../helpers/text.js");

class HTMLTitleElementImpl extends HTMLElementImpl {
  get text() {
    return childTextContent(this);
  }

  set text(value) {
    this.textContent = value;
  }
}

module.exports = {
  implementation: HTMLTitleElementImpl
};
