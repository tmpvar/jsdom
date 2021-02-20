"use strict";

const { mixin } = require("../../utils.js");
const SVGListBase = require("./SVGListBase.js");

class SVGStringListImpl {
  constructor(globalObject, args, privateData) {
    this._globalObject = globalObject;

    this._initList(privateData);
  }
}

mixin(SVGStringListImpl.prototype, SVGListBase.prototype);

exports.implementation = SVGStringListImpl;
