"use strict";

const { mixin } = require("../../utils.js");
const SVGElementImpl = require("./SVGElement-impl.js").implementation;
const SVGTestsImpl = require("./SVGTests-impl.js").implementation;

class SVGGraphicsElementImpl extends SVGElementImpl {}

SVGGraphicsElementImpl.attributeRegistry = new Map([
  ...SVGElementImpl.attributeRegistry,
  ...SVGTestsImpl.attributeRegistry
]);

mixin(SVGGraphicsElementImpl.prototype, SVGTestsImpl.prototype);

exports.implementation = SVGGraphicsElementImpl;
