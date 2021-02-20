"use strict";

const EventImpl = require("./Event-impl.js").implementation;

const ErrorEventInit = require("../generated/ErrorEventInit.js");

class ErrorEventImpl extends EventImpl {

}
ErrorEventImpl.defaultInit = ErrorEventInit.convert(undefined);

module.exports = {
  implementation: ErrorEventImpl
};
