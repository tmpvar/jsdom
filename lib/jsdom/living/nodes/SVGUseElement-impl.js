"use strict";

const SVGGraphicsElementImpl = require("./SVGGraphicsElement-impl").implementation;

class SVGUseElementImpl extends SVGGraphicsElementImpl {}

module.exports = {
  implementation: SVGUseElementImpl
};
