"use strict";

const { parseFragment } = require("../../browser/parser.js");
const { fragmentSerialization } = require("../domparsing/serialization.js");
const { nodeRoot } = require("../helpers/node.js");
const { mixin } = require("../../utils.js");

const DocumentFragment = require("./DocumentFragment-impl.js").implementation;
const DocumentOrShadowRootImpl = require("./DocumentOrShadowRoot-impl.js").implementation;

class ShadowRootImpl extends DocumentFragment {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);

    const { mode } = privateData;
    this._mode = mode;
  }

  _getTheParent(event) {
    if (!event.composed && this === nodeRoot(event._path[0].item)) {
      return null;
    }

    return this._host;
  }

  get mode() {
    return this._mode;
  }

  get host() {
    return this._host;
  }

  // https://w3c.github.io/DOM-Parsing/#dfn-innerhtml
  get innerHTML() {
    return fragmentSerialization(this, {
      requireWellFormed: true,
      globalObject: this._globalObject
    });
  }
  set innerHTML(markup) {
    const fragment = parseFragment(markup, this._host);
    this._replaceAll(fragment);
  }
}

mixin(ShadowRootImpl.prototype, DocumentOrShadowRootImpl.prototype);

module.exports = {
  implementation: ShadowRootImpl
};
