"use strict";

const { extractHighWaterMark, extractSizeAlgorithm } = require("./abstract-ops/queuing-strategy.js");
const aos = require("./abstract-ops/writable-streams.js");

const UnderlyingSink = require("../generated/UnderlyingSink.js");

exports.implementation = class WritableStreamImpl {
  constructor(globalObject, [underlyingSink, strategy]) {
    if (underlyingSink === undefined) {
      underlyingSink = null;
    }
    const underlyingSinkDict = UnderlyingSink.convert(underlyingSink);
    if ("type" in underlyingSinkDict) {
      throw new RangeError("Invalid type is specified");
    }

    aos.initializeWritableStream(globalObject, this);

    const sizeAlgorithm = extractSizeAlgorithm(strategy);
    const highWaterMark = extractHighWaterMark(strategy, 1);

    aos.setUpWritableStreamDefaultControllerFromUnderlyingSink(
      globalObject,
      this,
      underlyingSink,
      underlyingSinkDict,
      highWaterMark,
      sizeAlgorithm
    );
  }

  get locked() {
    return aos.isWritableStreamLocked(this);
  }

  abort(reason) {
    if (aos.isWritableStreamLocked(this) === true) {
      return Promise.reject(new TypeError("Cannot abort a stream that already has a writer"));
    }

    return aos.writableStreamAbort(this, reason);
  }

  close() {
    if (aos.isWritableStreamLocked(this) === true) {
      return Promise.reject(new TypeError("Cannot close a stream that already has a writer"));
    }

    if (aos.writableStreamCloseQueuedOrInFlight(this) === true) {
      return Promise.reject(new TypeError("Cannot close an already-closing stream"));
    }

    return aos.writableStreamClose(this);
  }

  getWriter() {
    return aos.acquireWritableStreamDefaultWriter(this._globalObject, this);
  }
};
