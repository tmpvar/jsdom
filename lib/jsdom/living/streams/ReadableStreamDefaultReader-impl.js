"use strict";

const { PromiseCapability } = require("./helpers/promises.js");
const aos = require("./abstract-ops/readable-streams.js");
const { mixin } = require("../../utils");
const ReadableStreamGenericReaderImpl = require("./ReadableStreamGenericReader-impl.js").implementation;

class ReadableStreamDefaultReaderImpl {
  constructor(globalObject, [stream]) {
    aos.setUpReadableStreamDefaultReader(this, stream);
  }

  read() {
    if (this._stream === undefined) {
      return Promise.reject(readerLockException("read from"));
    }

    const promiseCap = new PromiseCapability();
    const readRequest = {
      chunkSteps: chunk => promiseCap.resolve({ value: chunk, done: false }),
      closeSteps: () => promiseCap.resolve({ value: undefined, done: true }),
      errorSteps: e => promiseCap.reject(e)
    };

    aos.readableStreamDefaultReaderRead(this, readRequest);
    return promiseCap.promise;
  }

  releaseLock() {
    if (this._stream === undefined) {
      return;
    }

    if (this._readRequests.length > 0) {
      throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
    }

    aos.readableStreamReaderGenericRelease(this);
  }
}

mixin(ReadableStreamDefaultReaderImpl.prototype, ReadableStreamGenericReaderImpl.prototype);

exports.implementation = ReadableStreamDefaultReaderImpl;

function readerLockException(name) {
  return new TypeError("Cannot " + name + " a stream using a released reader");
}
