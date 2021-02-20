"use strict";

const MouseEventImpl = require("./MouseEvent-impl.js").implementation;

const WheelEventInit = require("../generated/WheelEventInit.js");

class WheelEventImpl extends MouseEventImpl {}
WheelEventImpl.defaultInit = WheelEventInit.convert(undefined);

module.exports = {
  implementation: WheelEventImpl
};
