"use strict";
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const { formOwner } = require("../helpers/form-controls.js");

class HTMLLegendElementImpl extends HTMLElementImpl {
  get form() {
    return formOwner(this);
  }
}

module.exports = {
  implementation: HTMLLegendElementImpl
};
