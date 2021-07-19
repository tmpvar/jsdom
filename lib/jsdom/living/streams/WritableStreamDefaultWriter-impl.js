"use strict";
const aos = require("./abstract-ops/writable-streams.js");

exports.implementation = class WritableStreamDefaultWriterImpl {
  constructor(globalObject, [stream]) {
    aos.setUpWritableStreamDefaultWriter(this, stream);
  }

  get closed() {
    return this._closedPromiseCap.promise;
  }

  get desiredSize() {
    if (this._stream === undefined) {
      throw defaultWriterLockException("desiredSize");
    }

    return aos.writableStreamDefaultWriterGetDesiredSize(this);
  }

  get ready() {
    return this._readyPromiseCap.promise;
  }

  abort(reason) {
    if (this._stream === undefined) {
      return Promise.reject(defaultWriterLockException("abort"));
    }

    return aos.writableStreamDefaultWriterAbort(this, reason);
  }

  close() {
    const stream = this._stream;

    if (stream === undefined) {
      return Promise.reject(defaultWriterLockException("close"));
    }

    if (aos.writableStreamCloseQueuedOrInFlight(stream) === true) {
      return Promise.reject(new TypeError("Cannot close an already-closing stream"));
    }

    return aos.writableStreamDefaultWriterClose(this);
  }

  releaseLock() {
    const stream = this._stream;

    if (stream === undefined) {
      return;
    }

    // Assert: stream._writer !== undefined

    aos.writableStreamDefaultWriterRelease(this);
  }

  write(chunk) {
    if (this._stream === undefined) {
      return Promise.reject(defaultWriterLockException("write to"));
    }

    return aos.writableStreamDefaultWriterWrite(this, chunk);
  }
};

function defaultWriterLockException(name) {
  return new TypeError("Cannot " + name + " a stream using a released writer");
}
