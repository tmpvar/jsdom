"use strict";

const UIEventImpl = require("./UIEvent-impl.js").implementation;

const TouchEventInit = require("../generated/TouchEventInit.js");

class TouchEventImpl extends UIEventImpl {

}
TouchEventImpl.defaultInit = TouchEventInit.convert(undefined);

module.exports = {
  implementation: TouchEventImpl
};
