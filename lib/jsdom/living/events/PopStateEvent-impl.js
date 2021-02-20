"use strict";
const EventImpl = require("./Event-impl.js").implementation;

const PopStateEventInit = require("../generated/PopStateEventInit.js");

class PopStateEventImpl extends EventImpl {}
PopStateEventImpl.defaultInit = PopStateEventInit.convert(undefined);

exports.implementation = PopStateEventImpl;
