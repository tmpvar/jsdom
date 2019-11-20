"use strict";

const MouseEventImpl = require("./MouseEvent-impl").implementation;

const PointerEventInit = require("../generated/PointerEventInit");

class PointerEventImpl extends MouseEventImpl {}
PointerEventImpl.defaultInit = PointerEventInit.convert(undefined);

module.exports = {
  implementation: PointerEventImpl
};
