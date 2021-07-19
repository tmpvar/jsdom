"use strict";

const { PromiseCapability } = require("./helpers/promises.js");
const { isDetachedBuffer } = require("./abstract-ops/ecmascript.js");
const aos = require("./abstract-ops/readable-streams.js");
const { mixin } = require("../../utils");
const ReadableStreamGenericReaderImpl = require("./ReadableStreamGenericReader-impl.js").implementation;

class ReadableStreamBYOBReaderImpl {
  constructor(globalObject, [stream]) {
    aos.setUpReadableStreamBYOBReader(this, stream);
  }

  read(view) {
    if (view.byteLength === 0) {
      return Promise.reject(new TypeError("view must have non-zero byteLength"));
    }
    if (view.buffer.byteLength === 0) {
      return Promise.reject(new TypeError("view's buffer must have non-zero byteLength"));
    }
    if (isDetachedBuffer(view.buffer) === true) {
      return Promise.reject(new TypeError("view's buffer has been detached"));
    }

    if (this._stream === undefined) {
      return Promise.reject(readerLockException("read"));
    }

    const promiseCap = new PromiseCapability();
    const readIntoRequest = {
      chunkSteps: chunk => promiseCap.resolve({ value: chunk, done: false }),
      closeSteps: chunk => promiseCap.resolve({ value: chunk, done: true }),
      errorSteps: e => promiseCap.reject(e)
    };
    aos.readableStreamBYOBReaderRead(this, view, readIntoRequest);
    return promiseCap.promise;
  }

  releaseLock() {
    if (this._stream === undefined) {
      return;
    }

    if (this._readIntoRequests.length > 0) {
      throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
    }

    aos.readableStreamReaderGenericRelease(this);
  }
}

mixin(ReadableStreamBYOBReaderImpl.prototype, ReadableStreamGenericReaderImpl.prototype);

exports.implementation = ReadableStreamBYOBReaderImpl;

function readerLockException(name) {
  return new TypeError("Cannot " + name + " a stream using a released reader");
}
