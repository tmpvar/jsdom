"use strict";
const verbose = require("debug")("streams:transform-stream:verbose");

const { PromiseCapability } = require("../helpers/promises.js");
const { createReadableStream, readableStreamDefaultControllerClose, readableStreamDefaultControllerEnqueue,
  readableStreamDefaultControllerError, readableStreamDefaultControllerHasBackpressure,
  readableStreamDefaultControllerCanCloseOrEnqueue } = require("./readable-streams.js");
const { createWritableStream, writableStreamDefaultControllerErrorIfNeeded } = require("./writable-streams.js");

const TransformStreamDefaultController = require("../../generated/TransformStreamDefaultController.js");

Object.assign(exports, {
  initializeTransformStream,
  setUpTransformStreamDefaultControllerFromTransformer,
  transformStreamDefaultControllerEnqueue,
  transformStreamDefaultControllerError,
  transformStreamDefaultControllerTerminate
});

// Working with transform streams

// CreateTransformStream is not implemented since it is only meant for external specs.

function initializeTransformStream(
  globalObject,
  stream,
  startPromise,
  writableHighWaterMark,
  writableSizeAlgorithm,
  readableHighWaterMark,
  readableSizeAlgorithm
) {
  function startAlgorithm() {
    return startPromise;
  }

  function writeAlgorithm(chunk) {
    return transformStreamDefaultSinkWriteAlgorithm(stream, chunk);
  }

  function abortAlgorithm(reason) {
    return transformStreamDefaultSinkAbortAlgorithm(stream, reason);
  }

  function closeAlgorithm() {
    return transformStreamDefaultSinkCloseAlgorithm(stream);
  }

  stream._writable = createWritableStream(
    globalObject,
    startAlgorithm,
    writeAlgorithm,
    closeAlgorithm,
    abortAlgorithm,
    writableHighWaterMark,
    writableSizeAlgorithm
  );

  function pullAlgorithm() {
    return transformStreamDefaultSourcePullAlgorithm(stream);
  }

  function cancelAlgorithm(reason) {
    transformStreamErrorWritableAndUnblockWrite(stream, reason);
    return Promise.resolve();
  }

  stream._readable = createReadableStream(
    globalObject,
    startAlgorithm,
    pullAlgorithm,
    cancelAlgorithm,
    readableHighWaterMark,
    readableSizeAlgorithm
  );

  // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
  stream._backpressure = undefined;
  stream._backpressureChangePromiseCap = undefined;
  transformStreamSetBackpressure(stream, true);

  stream._controller = undefined;
}

function transformStreamError(stream, e) {
  verbose("transformStreamError()");

  readableStreamDefaultControllerError(stream._readable._controller, e);
  transformStreamErrorWritableAndUnblockWrite(stream, e);
}

function transformStreamErrorWritableAndUnblockWrite(stream, e) {
  transformStreamDefaultControllerClearAlgorithms(stream._controller);
  writableStreamDefaultControllerErrorIfNeeded(stream._writable._controller, e);
  if (stream._backpressure === true) {
    // Pretend that pull() was called to permit any pending write() calls to complete. transformStreamSetBackpressure()
    // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
    // _backpressure is set.
    transformStreamSetBackpressure(stream, false);
  }
}

function transformStreamSetBackpressure(stream, backpressure) {
  verbose(`transformStreamSetBackpressure() [backpressure = ${backpressure}]`);

  // Passes also when called during construction.
  // Assert: stream._backpressure !== backpressure

  if (stream._backpressureChangePromiseCap !== undefined) {
    stream._backpressureChangePromiseCap.resolve();
  }

  stream._backpressureChangePromiseCap = new PromiseCapability();

  stream._backpressure = backpressure;
}

// Default controllers

function setUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
  // Assert: TransformStream.isImpl(stream)
  // Assert: stream._controller === undefined

  controller._stream = stream;
  stream._controller = controller;

  controller._transformAlgorithm = transformAlgorithm;
  controller._flushAlgorithm = flushAlgorithm;
}

function setUpTransformStreamDefaultControllerFromTransformer(globalObject, stream, transformer, transformerDict) {
  const controller = TransformStreamDefaultController.new(globalObject);

  // eslint-disable-next-line func-style
  let transformAlgorithm = chunk => {
    try {
      transformStreamDefaultControllerEnqueue(controller, chunk);
      return Promise.resolve();
    } catch (transformResultE) {
      return Promise.reject(transformResultE);
    }
  };

  // eslint-disable-next-line func-style
  let flushAlgorithm = () => Promise.resolve();

  if ("transform" in transformerDict) {
    transformAlgorithm = chunk => transformerDict.transform.call(transformer, chunk, controller);
  }
  if ("flush" in transformerDict) {
    flushAlgorithm = () => transformerDict.flush.call(transformer, controller);
  }

  setUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
}

function transformStreamDefaultControllerClearAlgorithms(controller) {
  controller._transformAlgorithm = undefined;
  controller._flushAlgorithm = undefined;
}

function transformStreamDefaultControllerEnqueue(controller, chunk) {
  verbose("transformStreamDefaultControllerEnqueue()");

  const stream = controller._stream;
  const readableController = stream._readable._controller;
  if (readableStreamDefaultControllerCanCloseOrEnqueue(readableController) === false) {
    throw new TypeError("Readable side is not in a state that permits enqueue");
  }

  // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
  // accept transformStreamDefaultControllerEnqueue() calls.

  try {
    readableStreamDefaultControllerEnqueue(readableController, chunk);
  } catch (e) {
    // This happens when readableStrategy.size() throws.
    transformStreamErrorWritableAndUnblockWrite(stream, e);

    throw stream._readable._storedError;
  }

  const backpressure = readableStreamDefaultControllerHasBackpressure(readableController);
  if (backpressure !== stream._backpressure) {
    // Assert: backpressure === true
    transformStreamSetBackpressure(stream, true);
  }
}

function transformStreamDefaultControllerError(controller, e) {
  transformStreamError(controller._stream, e);
}

function transformStreamDefaultControllerPerformTransform(controller, chunk) {
  const transformPromise = controller._transformAlgorithm(chunk);
  return transformPromise.catch(r => {
    transformStreamError(controller._stream, r);
    throw r;
  });
}

function transformStreamDefaultControllerTerminate(controller) {
  verbose("transformStreamDefaultControllerTerminate()");

  const stream = controller._stream;
  const readableController = stream._readable._controller;

  readableStreamDefaultControllerClose(readableController);

  const error = new TypeError("TransformStream terminated");
  transformStreamErrorWritableAndUnblockWrite(stream, error);
}

// Default sinks

function transformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
  verbose("transformStreamDefaultSinkWriteAlgorithm()");

  // Assert: stream._writable._state === "writable"

  const controller = stream._controller;

  if (stream._backpressure === true) {
    const backpressureChangePromise = stream._backpressureChangePromiseCap.promise;
    // Assert: backpressureChangePromise !== undefined
    return backpressureChangePromise.then(() => {
      const writable = stream._writable;
      const state = writable._state;
      if (state === "erroring") {
        throw writable._storedError;
      }
      // Assert: state === "writable"
      return transformStreamDefaultControllerPerformTransform(controller, chunk);
    });
  }

  return transformStreamDefaultControllerPerformTransform(controller, chunk);
}

function transformStreamDefaultSinkAbortAlgorithm(stream, reason) {
  // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
  // errored.
  transformStreamError(stream, reason);
  return Promise.resolve();
}

function transformStreamDefaultSinkCloseAlgorithm(stream) {
  verbose("transformStreamDefaultSinkCloseAlgorithm()");

  // stream._readable cannot change after construction, so caching it across a call to user code is safe.
  const readable = stream._readable;

  const controller = stream._controller;
  const flushPromise = controller._flushAlgorithm();
  transformStreamDefaultControllerClearAlgorithms(controller);

  // Return a promise that is fulfilled with undefined on success.
  return flushPromise.then(() => {
    if (readable._state === "errored") {
      throw readable._storedError;
    }
    readableStreamDefaultControllerClose(readable._controller);
  }, r => {
    transformStreamError(stream, r);
    throw readable._storedError;
  });
}

// Default sources

function transformStreamDefaultSourcePullAlgorithm(stream) {
  verbose("transformStreamDefaultSourcePullAlgorithm()");

  // Invariant. Enforced by the promises returned by start() and pull().
  // Assert: stream._backpressure === true

  // Assert: stream._backpressureChangePromiseCap !== undefined

  transformStreamSetBackpressure(stream, false);

  // Prevent the next pull() call until there is backpressure.
  return stream._backpressureChangePromiseCap.promise;
}
