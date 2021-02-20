"use strict";

const AbortSignal = require("../generated/AbortSignal.js");

class AbortControllerImpl {
  constructor(globalObject) {
    this.signal = AbortSignal.createImpl(globalObject, []);
  }

  abort() {
    this.signal._signalAbort();
  }
}

module.exports = {
  implementation: AbortControllerImpl
};
