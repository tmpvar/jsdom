"use strict";

const EventImpl = require("./Event-impl.js").implementation;

const ProgressEventInit = require("../generated/ProgressEventInit.js");

class ProgressEventImpl extends EventImpl {

}
ProgressEventImpl.defaultInit = ProgressEventInit.convert(undefined);

module.exports = {
  implementation: ProgressEventImpl
};
