"use strict";

const EventImpl = require("./Event-impl.js").implementation;

const CloseEventInit = require("../generated/CloseEventInit.js");

class CloseEventImpl extends EventImpl {}
CloseEventImpl.defaultInit = CloseEventInit.convert(undefined);

exports.implementation = CloseEventImpl;
