"use strict";

const EventImpl = require("./Event-impl.js").implementation;

const HashChangeEventInit = require("../generated/HashChangeEventInit.js");

class HashChangeEventImpl extends EventImpl {

}
HashChangeEventImpl.defaultInit = HashChangeEventInit.convert(undefined);

module.exports = {
  implementation: HashChangeEventImpl
};
