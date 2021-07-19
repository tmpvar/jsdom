"use strict";
const { PromiseCapability, setPromiseIsHandledToTrue } = require("./helpers/promises.js");
const { extractHighWaterMark, extractSizeAlgorithm } = require("./abstract-ops/queuing-strategy.js");
const aos = require("./abstract-ops/readable-streams.js");
const wsAOs = require("./abstract-ops/writable-streams.js");

const idlUtils = require("../generated/utils.js");
const UnderlyingSource = require("../generated/UnderlyingSource.js");

exports.implementation = class ReadableStreamImpl {
  constructor(globalObject, [underlyingSource, strategy]) {
    if (underlyingSource === undefined) {
      underlyingSource = null;
    }
    const underlyingSourceDict = UnderlyingSource.convert(underlyingSource);

    aos.initializeReadableStream(globalObject, this);

    if (underlyingSourceDict.type === "bytes") {
      throw new RangeError("Readable byte streams are not implemented");

      // eslint-disable-next-line no-unreachable
      if ("size" in strategy) {
        throw new RangeError("The strategy for a byte stream cannot have a size function");
      }

      const highWaterMark = extractHighWaterMark(strategy, 0);
      aos.setUpReadableByteStreamControllerFromUnderlyingSource(
        globalObject,
        this,
        underlyingSource,
        underlyingSourceDict,
        highWaterMark
      );
    } else {
      // Assert: !("type" in underlyingSourceDict)
      const sizeAlgorithm = extractSizeAlgorithm(strategy);
      const highWaterMark = extractHighWaterMark(strategy, 1);
      aos.setUpReadableStreamDefaultControllerFromUnderlyingSource(
        globalObject,
        this,
        underlyingSource,
        underlyingSourceDict,
        highWaterMark,
        sizeAlgorithm
      );
    }
  }

  get locked() {
    return aos.isReadableStreamLocked(this);
  }

  cancel(reason) {
    if (aos.isReadableStreamLocked(this) === true) {
      return Promise.reject(new TypeError("Cannot cancel a stream that already has a reader"));
    }

    return aos.readableStreamCancel(this, reason);
  }

  getReader(options) {
    if (!("mode" in options)) {
      return aos.acquireReadableStreamDefaultReader(this._globalObject, this);
    }

    // Assert: options.mode === "byob"

    // acquireReadableStreamBYOBReader assumes the ReadableStreamBYOBReader
    // interface exists; it doesn't, so, throw early here.
    throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");

    // eslint-disable-next-line no-unreachable
    return aos.acquireReadableStreamBYOBReader(this._globalObject, this);
  }

  pipeThrough(transform, options) {
    if (aos.isReadableStreamLocked(this) === true) {
      throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
    }
    if (wsAOs.isWritableStreamLocked(transform.writable) === true) {
      throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
    }

    const promise = aos.readableStreamPipeTo(
      this._globalObject,
      this,
      transform.writable,
      options.preventClose,
      options.preventAbort,
      options.preventCancel,
      options.signal
    );

    setPromiseIsHandledToTrue(promise);

    return transform.readable;
  }

  pipeTo(destination, options) {
    if (aos.isReadableStreamLocked(this) === true) {
      return Promise.reject(
        new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream")
      );
    }
    if (wsAOs.isWritableStreamLocked(destination) === true) {
      return Promise.reject(
        new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream")
      );
    }

    return aos.readableStreamPipeTo(
      this._globalObject,
      this,
      destination,
      options.preventClose,
      options.preventAbort,
      options.preventCancel,
      options.signal
    );
  }

  tee() {
    // Conversion here is only needed until https://github.com/jsdom/webidl2js/pull/108 gets merged.
    return aos.readableStreamTee(this._globalObject, this, false).map(idlUtils.wrapperForImpl);
  }

  [idlUtils.asyncIteratorInit](iterator, [options]) {
    iterator._reader = aos.acquireReadableStreamDefaultReader(this._globalObject, this);
    iterator._preventCancel = options.preventCancel;
  }

  [idlUtils.asyncIteratorNext](iterator) {
    const reader = iterator._reader;
    if (reader._stream === undefined) {
      return Promise.reject(
        new TypeError("Cannot get the next iteration result once the reader has been released")
      );
    }

    const promiseCap = new PromiseCapability();
    const readRequest = {
      chunkSteps: chunk => promiseCap.resolve(chunk),
      closeSteps: () => {
        aos.readableStreamReaderGenericRelease(reader);
        promiseCap.resolve(idlUtils.asyncIteratorEOI);
      },
      errorSteps: e => {
        aos.readableStreamReaderGenericRelease(reader);
        promiseCap.reject(e);
      }
    };
    aos.readableStreamDefaultReaderRead(reader, readRequest);
    return promiseCap.promise;
  }

  [idlUtils.asyncIteratorReturn](iterator, arg) {
    const reader = iterator._reader;
    if (reader._stream === undefined) {
      return Promise.resolve();
    }

    // Assert: reader._readRequests.length === 0

    if (iterator._preventCancel === false) {
      const result = aos.readableStreamReaderGenericCancel(reader, arg);
      aos.readableStreamReaderGenericRelease(reader);
      return result;
    }

    aos.readableStreamReaderGenericRelease(reader);
    return Promise.resolve();
  }
};
