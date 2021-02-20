"use strict";
const UIEventImpl = require("./UIEvent-impl.js").implementation;

const FocusEventInit = require("../generated/FocusEventInit.js");

class FocusEventImpl extends UIEventImpl {}
FocusEventImpl.defaultInit = FocusEventInit.convert(undefined);

exports.implementation = FocusEventImpl;
