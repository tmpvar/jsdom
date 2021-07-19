"use strict";

const aos = require("./abstract-ops/readable-streams.js");

exports.implementation = class ReadableStreamGenericReaderImpl {
  get closed() {
    return this._closedPromiseCap.promise;
  }

  cancel(reason) {
    if (this._stream === undefined) {
      return Promise.reject(readerLockException("cancel"));
    }

    return aos.readableStreamReaderGenericCancel(this, reason);
  }
};

function readerLockException(name) {
  return new TypeError("Cannot " + name + " a stream using a released reader");
}
