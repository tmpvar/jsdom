"use strict";

const { PromiseCapability, setPromiseIsHandledToTrue } = require("../helpers/promises.js");
const { copyDataBlockBytes, createArrayFromList, isDetachedBuffer, transferArrayBuffer } =
  require("./ecmascript.js");
const { enqueueValueWithSize, resetQueue } = require("./queue-with-sizes.js");
const { acquireWritableStreamDefaultWriter, writableStreamAbort,
  writableStreamDefaultWriterCloseWithErrorPropagation, writableStreamDefaultWriterRelease,
  writableStreamDefaultWriterWrite, writableStreamCloseQueuedOrInFlight } = require("./writable-streams.js");
const { CancelSteps, PullSteps } = require("./internal-methods.js");

const DOMException = require("domexception/webidl2js-wrapper");
const ReadableByteStreamController = require("../../generated/ReadableByteStreamController.js");
const ReadableStreamBYOBReader = require("../../generated/ReadableStreamBYOBReader.js");
const ReadableStreamDefaultReader = require("../../generated/ReadableStreamDefaultReader.js");
const ReadableStreamDefaultController = require("../../generated/ReadableStreamDefaultController.js");
const ReadableStream = require("../../generated/ReadableStream.js");

Object.assign(exports, {
  acquireReadableStreamBYOBReader,
  acquireReadableStreamDefaultReader,
  createReadableStream,
  initializeReadableStream,
  isReadableStreamLocked,
  readableByteStreamControllerCallPullIfNeeded,
  readableByteStreamControllerClearAlgorithms,
  readableByteStreamControllerClearPendingPullIntos,
  readableByteStreamControllerClose,
  readableByteStreamControllerEnqueue,
  readableByteStreamControllerError,
  readableByteStreamControllerGetDesiredSize,
  readableByteStreamControllerHandleQueueDrain,
  readableByteStreamControllerRespond,
  readableByteStreamControllerRespondWithNewView,
  readableStreamAddReadRequest,
  readableStreamBYOBReaderRead,
  readableStreamCancel,
  readableStreamClose,
  readableStreamDefaultControllerCallPullIfNeeded,
  readableStreamDefaultControllerCanCloseOrEnqueue,
  readableStreamDefaultControllerClearAlgorithms,
  readableStreamDefaultControllerClose,
  readableStreamDefaultControllerEnqueue,
  readableStreamDefaultControllerError,
  readableStreamDefaultControllerGetDesiredSize,
  readableStreamDefaultControllerHasBackpressure,
  readableStreamDefaultReaderRead,
  readableStreamGetNumReadRequests,
  readableStreamHasDefaultReader,
  readableStreamPipeTo,
  readableStreamReaderGenericCancel,
  readableStreamReaderGenericRelease,
  readableStreamTee,
  setUpReadableByteStreamControllerFromUnderlyingSource,
  setUpReadableStreamBYOBReader,
  setUpReadableStreamDefaultControllerFromUnderlyingSource,
  setUpReadableStreamDefaultReader
});

// Working with readable streams

function acquireReadableStreamBYOBReader(globalObject, stream) {
  const reader = ReadableStreamBYOBReader.new(globalObject);
  setUpReadableStreamBYOBReader(reader, stream);
  return reader;
}

function acquireReadableStreamDefaultReader(globalObject, stream) {
  const reader = ReadableStreamDefaultReader.new(globalObject);
  setUpReadableStreamDefaultReader(reader, stream);
  return reader;
}

function createReadableStream(
  globalObject,
  startAlgorithm,
  pullAlgorithm,
  cancelAlgorithm,
  highWaterMark = 1,
  sizeAlgorithm = () => 1
) {
  // Assert: isNonNegativeNumber(highWaterMark) === true

  const stream = ReadableStream.new(globalObject);
  initializeReadableStream(globalObject, stream);

  const controller = ReadableStreamDefaultController.new(globalObject);
  setUpReadableStreamDefaultController(
    stream,
    controller,
    startAlgorithm,
    pullAlgorithm,
    cancelAlgorithm,
    highWaterMark,
    sizeAlgorithm
  );

  return stream;
}

// CreateReadableByteStream is not implemented since it is only meant for external specs.

function initializeReadableStream(globalObject, stream) {
  stream._globalObject = globalObject;
  stream._state = "readable";
  stream._reader = undefined;
  stream._storedError = undefined;
  stream._disturbed = false;
}

// IsReadableStreamDisturbed is not implemented since it is only meant for external specs.

function isReadableStreamLocked(stream) {
  if (stream._reader === undefined) {
    return false;
  }

  return true;
}

function readableStreamPipeTo(globalObject, source, dest, preventClose, preventAbort, preventCancel, signal) {
  // Assert: ReadableStream.isImpl(source)
  // Assert: WritableStream.isImpl(dest)
  // Assert: typeof preventClose === "boolean"
  // Assert: typeof preventAbort === "boolean"
  // Assert: typeof preventCancel === "boolean"
  // Assert: signal === undefined || AbortSignal.isImpl(signal)
  // Assert: isReadableStreamLocked(source) === false
  // Assert: isWritableStreamLocked(dest) === false

  const reader = acquireReadableStreamDefaultReader(globalObject, source);
  const writer = acquireWritableStreamDefaultWriter(globalObject, dest);

  source._disturbed = true;

  let shuttingDown = false;

  // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
  let currentWrite = Promise.resolve();

  return new Promise((resolve, reject) => {
    let abortAlgorithm;
    if (signal !== undefined) {
      abortAlgorithm = () => {
        const error = DOMException.create(globalObject, ["Aborted", "AbortError"]);
        const actions = [];
        if (preventAbort === false) {
          actions.push(() => {
            if (dest._state === "writable") {
              return writableStreamAbort(dest, error);
            }
            return Promise.resolve();
          });
        }
        if (preventCancel === false) {
          actions.push(() => {
            if (source._state === "readable") {
              return readableStreamCancel(source, error);
            }
            return Promise.resolve();
          });
        }
        shutdownWithAction(() => Promise.all(actions.map(action => action()), results => results), true, error);
      };

      if (signal.aborted === true) {
        abortAlgorithm();
        return;
      }

      signal.addEventListener("abort", abortAlgorithm);
    }

    // Using reader and writer, read all chunks from this and write them to dest
    // - Backpressure must be enforced
    // - Shutdown must stop all activity
    function pipeLoop() {
      return new Promise((resolveLoop, rejectLoop) => {
        function next(done) {
          if (done) {
            resolveLoop();
          } else {
            pipeStep().then(next, rejectLoop);
          }
        }

        next(false);
      });
    }

    function pipeStep() {
      if (shuttingDown === true) {
        return Promise.resolve(true);
      }

      return writer._readyPromiseCap.promise.then(() => {
        return new Promise((resolveRead, rejectRead) => {
          readableStreamDefaultReaderRead(
            reader,
            {
              chunkSteps: chunk => {
                currentWrite = writableStreamDefaultWriterWrite(writer, chunk).catch(
                  () => {}
                );
                resolveRead(false);
              },
              closeSteps: () => resolveRead(true),
              errorSteps: rejectRead
            }
          );
        });
      });
    }

    // Errors must be propagated forward
    isOrBecomesErrored(source, reader._closedPromiseCap.promise, storedError => {
      if (preventAbort === false) {
        shutdownWithAction(() => writableStreamAbort(dest, storedError), true, storedError);
      } else {
        shutdown(true, storedError);
      }
    });

    // Errors must be propagated backward
    isOrBecomesErrored(dest, writer._closedPromiseCap.promise, storedError => {
      if (preventCancel === false) {
        shutdownWithAction(() => readableStreamCancel(source, storedError), true, storedError);
      } else {
        shutdown(true, storedError);
      }
    });

    // Closing must be propagated forward
    isOrBecomesClosed(source, reader._closedPromiseCap.promise, () => {
      if (preventClose === false) {
        shutdownWithAction(() => writableStreamDefaultWriterCloseWithErrorPropagation(writer));
      } else {
        shutdown();
      }
    });

    // Closing must be propagated backward
    if (writableStreamCloseQueuedOrInFlight(dest) === true || dest._state === "closed") {
      const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");

      if (preventCancel === false) {
        shutdownWithAction(() => readableStreamCancel(source, destClosed), true, destClosed);
      } else {
        shutdown(true, destClosed);
      }
    }

    setPromiseIsHandledToTrue(pipeLoop());

    function waitForWritesToFinish() {
      // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
      // for that too.
      const oldCurrentWrite = currentWrite;
      return currentWrite.then(
        () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined
      );
    }

    function isOrBecomesErrored(stream, promise, action) {
      if (stream._state === "errored") {
        action(stream._storedError);
      } else {
        promise.catch(action);
      }
    }

    function isOrBecomesClosed(stream, promise, action) {
      if (stream._state === "closed") {
        action();
      } else {
        promise.then(action);
      }
    }

    function shutdownWithAction(action, originalIsError, originalError) {
      if (shuttingDown === true) {
        return;
      }
      shuttingDown = true;

      if (dest._state === "writable" && writableStreamCloseQueuedOrInFlight(dest) === false) {
        waitForWritesToFinish().then(doTheRest);
      } else {
        doTheRest();
      }

      function doTheRest() {
        action().then(
          () => finalize(originalIsError, originalError),
          newError => finalize(true, newError)
        );
      }
    }

    function shutdown(isError, error) {
      if (shuttingDown === true) {
        return;
      }
      shuttingDown = true;

      if (dest._state === "writable" && writableStreamCloseQueuedOrInFlight(dest) === false) {
        waitForWritesToFinish().then(() => finalize(isError, error));
      } else {
        finalize(isError, error);
      }
    }

    function finalize(isError, error) {
      writableStreamDefaultWriterRelease(writer);
      readableStreamReaderGenericRelease(reader);

      if (signal !== undefined) {
        signal.removeEventListener("abort", abortAlgorithm);
      }
      if (isError) {
        reject(error);
      } else {
        resolve(undefined);
      }
    }
  });
}

function readableStreamTee(globalObject, stream, cloneForBranch2) {
  // Assert: ReadableStream.isImpl(stream)
  // Assert: typeof cloneForBranch2 === "boolean"

  const reader = acquireReadableStreamDefaultReader(globalObject, stream);

  let reading = false;
  let canceled1 = false;
  let canceled2 = false;
  let reason1,
    reason2,
    branch1,
    branch2;

  const cancelPromiseCap = new PromiseCapability();

  function pullAlgorithm() {
    if (reading === true) {
      return Promise.resolve();
    }

    reading = true;

    const readRequest = {
      chunkSteps: value => {
        // This needs to be delayed a microtask because it takes at least a
        // microtask to detect errors (using reader._closedPromiseCap below),
        // and we want errors in stream to error both branches immediately. We
        // cannot let successful synchronously-available reads get ahead of
        // asynchronously-available errors.
        queueMicrotask(() => {
          reading = false;
          const value1 = value;
          const value2 = value;

          // There is no way to access the cloning code right now in the reference implementation.
          // If we add one then we'll need an implementation for serializable objects.
          if (canceled2 === false && cloneForBranch2 === true) {
            // value2 = structuredDeserialize(structuredSerialize(value2));
          }

          if (canceled1 === false) {
            readableStreamDefaultControllerEnqueue(branch1._controller, value1);
          }

          if (canceled2 === false) {
            readableStreamDefaultControllerEnqueue(branch2._controller, value2);
          }
        });
      },
      closeSteps: () => {
        reading = false;
        if (canceled1 === false) {
          readableStreamDefaultControllerClose(branch1._controller);
        }
        if (canceled2 === false) {
          readableStreamDefaultControllerClose(branch2._controller);
        }
        if (canceled1 === false || canceled2 === false) {
          cancelPromiseCap.resolve();
        }
      },
      errorSteps: () => {
        reading = false;
      }
    };
    readableStreamDefaultReaderRead(reader, readRequest);

    return Promise.resolve();
  }

  function cancel1Algorithm(reason) {
    canceled1 = true;
    reason1 = reason;
    if (canceled2 === true) {
      const compositeReason = createArrayFromList([reason1, reason2]);
      const cancelResult = readableStreamCancel(stream, compositeReason);
      cancelPromiseCap.resolve(cancelResult);
    }
    return cancelPromiseCap.promise;
  }

  function cancel2Algorithm(reason) {
    canceled2 = true;
    reason2 = reason;
    if (canceled1 === true) {
      const compositeReason = createArrayFromList([reason1, reason2]);
      const cancelResult = readableStreamCancel(stream, compositeReason);
      cancelPromiseCap.resolve(cancelResult);
    }
    return cancelPromiseCap.promise;
  }

  function startAlgorithm() {}

  branch1 = createReadableStream(globalObject, startAlgorithm, pullAlgorithm, cancel1Algorithm);
  branch2 = createReadableStream(globalObject, startAlgorithm, pullAlgorithm, cancel2Algorithm);

  reader._closedPromiseCap.promise.catch(r => {
    readableStreamDefaultControllerError(branch1._controller, r);
    readableStreamDefaultControllerError(branch2._controller, r);
    if (canceled1 === false || canceled2 === false) {
      cancelPromiseCap.resolve();
    }
  });

  return [branch1, branch2];
}

// Interfacing with controllers

function readableStreamAddReadIntoRequest(stream, readRequest) {
  // Assert: ReadableStreamBYOBReader.isImpl(stream._reader)
  // Assert: stream._state === "readable" || stream._state === "closed"

  stream._reader._readIntoRequests.push(readRequest);
}

function readableStreamAddReadRequest(stream, readRequest) {
  // Assert: ReadableStreamDefaultReader.isImpl(stream._reader)
  // Assert: stream._state === "readable"

  stream._reader._readRequests.push(readRequest);
}

function readableStreamCancel(stream, reason) {
  stream._disturbed = true;

  if (stream._state === "closed") {
    return Promise.resolve();
  }
  if (stream._state === "errored") {
    return Promise.reject(stream._storedError);
  }

  readableStreamClose(stream);

  const reader = stream._reader;
  if (reader !== undefined && ReadableStreamBYOBReader.isImpl(reader)) {
    for (const readIntoRequest of reader._readIntoRequests) {
      readIntoRequest.closeSteps(undefined);
    }
    reader._readIntoRequests = [];
  }

  const sourceCancelPromise = stream._controller[CancelSteps](reason);
  return sourceCancelPromise.then(() => undefined);
}

function readableStreamClose(stream) {
  // Assert: stream._state === "readable"

  stream._state = "closed";

  const reader = stream._reader;

  if (reader === undefined) {
    return;
  }

  reader._closedPromiseCap.resolve();

  if (ReadableStreamDefaultReader.isImpl(reader)) {
    for (const readRequest of reader._readRequests) {
      readRequest.closeSteps();
    }
    reader._readRequests = [];
  }
}

function readableStreamError(stream, e) {
  // Assert: stream._state === "readable"

  stream._state = "errored";
  stream._storedError = e;

  const reader = stream._reader;

  if (reader === undefined) {
    return;
  }

  reader._closedPromiseCap.reject(e);
  setPromiseIsHandledToTrue(reader._closedPromiseCap.promise);

  if (ReadableStreamDefaultReader.isImpl(reader)) {
    for (const readRequest of reader._readRequests) {
      readRequest.errorSteps(e);
    }

    reader._readRequests = [];
  } else {
    // Assert: ReadableStreamBYOBReader.isImpl(reader)

    for (const readIntoRequest of reader._readIntoRequests) {
      readIntoRequest.errorSteps(e);
    }

    reader._readIntoRequests = [];
  }
}

function readableStreamFulfillReadIntoRequest(stream, chunk, done) {
  const reader = stream._reader;

  // Assert: reader._readIntoRequests.length > 0

  const readIntoRequest = reader._readIntoRequests.shift();
  if (done) {
    readIntoRequest.closeSteps(chunk);
  } else {
    readIntoRequest.chunkSteps(chunk);
  }
}

function readableStreamFulfillReadRequest(stream, chunk, done) {
  const reader = stream._reader;

  // Assert: reader._readRequests.length > 0

  const readRequest = reader._readRequests.shift();
  if (done) {
    readRequest.closeSteps();
  } else {
    readRequest.chunkSteps(chunk);
  }
}

function readableStreamGetNumReadIntoRequests(stream) {
  return stream._reader._readIntoRequests.length;
}

function readableStreamGetNumReadRequests(stream) {
  return stream._reader._readRequests.length;
}

function readableStreamHasBYOBReader(stream) {
  const reader = stream._reader;

  if (reader === undefined) {
    return false;
  }

  if (ReadableStreamBYOBReader.isImpl(reader)) {
    return true;
  }

  return false;
}

function readableStreamHasDefaultReader(stream) {
  const reader = stream._reader;

  if (reader === undefined) {
    return false;
  }

  if (ReadableStreamDefaultReader.isImpl(reader)) {
    return true;
  }

  return false;
}

// Readers

function readableStreamReaderGenericCancel(reader, reason) {
  const stream = reader._stream;
  // Assert: stream !== undefined
  return readableStreamCancel(stream, reason);
}

function readableStreamReaderGenericInitialize(reader, stream) {
  reader._stream = stream;
  stream._reader = reader;

  if (stream._state === "readable") {
    reader._closedPromiseCap = new PromiseCapability();
  } else if (stream._state === "closed") {
    reader._closedPromiseCap = PromiseCapability.resolved();
  } else {
    // Assert: stream._state === "errored"

    reader._closedPromiseCap = PromiseCapability.rejected(stream._storedError);
    setPromiseIsHandledToTrue(reader._closedPromiseCap.promise);
  }
}

function readableStreamReaderGenericRelease(reader) {
  // Assert: reader._stream !== undefined
  // Assert: reader._stream._reader === reader

  if (reader._stream._state === "readable") {
    reader._closedPromiseCap.reject(
      new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")
    );
  } else {
    reader._closedPromiseCap = PromiseCapability.rejected(
      new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")
    );
  }
  setPromiseIsHandledToTrue(reader._closedPromiseCap.promise);

  reader._stream._reader = undefined;
  reader._stream = undefined;
}

function readableStreamBYOBReaderRead(reader, view, readIntoRequest) {
  const stream = reader._stream;

  // Assert: stream !== undefined

  stream._disturbed = true;

  if (stream._state === "errored") {
    readIntoRequest.errorSteps(stream._storedError);
  } else {
    readableByteStreamControllerPullInto(stream._controller, view, readIntoRequest);
  }
}

function readableStreamDefaultReaderRead(reader, readRequest) {
  const stream = reader._stream;

  // Assert: stream !== undefined

  stream._disturbed = true;

  if (stream._state === "closed") {
    readRequest.closeSteps();
  } else if (stream._state === "errored") {
    readRequest.errorSteps(stream._storedError);
  } else {
    // Assert: stream._state === "readable"
    stream._controller[PullSteps](readRequest);
  }
}

function setUpReadableStreamBYOBReader(reader, stream) {
  if (isReadableStreamLocked(stream) === true) {
    throw new TypeError("This stream has already been locked for exclusive reading by another reader");
  }

  if (!ReadableByteStreamController.isImpl(stream._controller)) {
    throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
  }

  readableStreamReaderGenericInitialize(reader, stream);

  reader._readIntoRequests = [];
}

function setUpReadableStreamDefaultReader(reader, stream) {
  if (isReadableStreamLocked(stream) === true) {
    throw new TypeError("This stream has already been locked for exclusive reading by another reader");
  }

  readableStreamReaderGenericInitialize(reader, stream);

  reader._readRequests = [];
}

// Default controllers

function readableStreamDefaultControllerCallPullIfNeeded(controller) {
  const shouldPull = readableStreamDefaultControllerShouldCallPull(controller);
  if (shouldPull === false) {
    return;
  }

  if (controller._pulling === true) {
    controller._pullAgain = true;
    return;
  }

  // Assert: controller._pullAgain === false

  controller._pulling = true;

  const pullPromise = controller._pullAlgorithm();
  pullPromise.then(
    () => {
      controller._pulling = false;

      if (controller._pullAgain === true) {
        controller._pullAgain = false;
        readableStreamDefaultControllerCallPullIfNeeded(controller);
      }
    },
    e => {
      readableStreamDefaultControllerError(controller, e);
    }
  );
}

function readableStreamDefaultControllerShouldCallPull(controller) {
  const stream = controller._stream;

  if (readableStreamDefaultControllerCanCloseOrEnqueue(controller) === false) {
    return false;
  }

  if (controller._started === false) {
    return false;
  }

  if (isReadableStreamLocked(stream) === true && readableStreamGetNumReadRequests(stream) > 0) {
    return true;
  }

  const desiredSize = readableStreamDefaultControllerGetDesiredSize(controller);
  // Assert: desiredSize !== null
  if (desiredSize > 0) {
    return true;
  }

  return false;
}

function readableStreamDefaultControllerClearAlgorithms(controller) {
  controller._pullAlgorithm = undefined;
  controller._cancelAlgorithm = undefined;
  controller._strategySizeAlgorithm = undefined;
}

function readableStreamDefaultControllerClose(controller) {
  if (readableStreamDefaultControllerCanCloseOrEnqueue(controller) === false) {
    return;
  }

  const stream = controller._stream;

  controller._closeRequested = true;

  if (controller._queue.length === 0) {
    readableStreamDefaultControllerClearAlgorithms(controller);
    readableStreamClose(stream);
  }
}

function readableStreamDefaultControllerEnqueue(controller, chunk) {
  if (readableStreamDefaultControllerCanCloseOrEnqueue(controller) === false) {
    return;
  }

  const stream = controller._stream;

  if (isReadableStreamLocked(stream) === true && readableStreamGetNumReadRequests(stream) > 0) {
    readableStreamFulfillReadRequest(stream, chunk, false);
  } else {
    let chunkSize;
    try {
      chunkSize = controller._strategySizeAlgorithm(chunk);
    } catch (chunkSizeE) {
      readableStreamDefaultControllerError(controller, chunkSizeE);
      throw chunkSizeE;
    }

    try {
      enqueueValueWithSize(controller, chunk, chunkSize);
    } catch (enqueueE) {
      readableStreamDefaultControllerError(controller, enqueueE);
      throw enqueueE;
    }
  }

  readableStreamDefaultControllerCallPullIfNeeded(controller);
}

function readableStreamDefaultControllerError(controller, e) {
  const stream = controller._stream;

  if (stream._state !== "readable") {
    return;
  }

  resetQueue(controller);

  readableStreamDefaultControllerClearAlgorithms(controller);
  readableStreamError(stream, e);
}

function readableStreamDefaultControllerGetDesiredSize(controller) {
  const state = controller._stream._state;

  if (state === "errored") {
    return null;
  }
  if (state === "closed") {
    return 0;
  }

  return controller._strategyHWM - controller._queueTotalSize;
}

function readableStreamDefaultControllerHasBackpressure(controller) {
  if (readableStreamDefaultControllerShouldCallPull(controller) === true) {
    return false;
  }

  return true;
}

function readableStreamDefaultControllerCanCloseOrEnqueue(controller) {
  const state = controller._stream._state;

  if (controller._closeRequested === false && state === "readable") {
    return true;
  }

  return false;
}

function setUpReadableStreamDefaultController(
  stream,
  controller,
  startAlgorithm,
  pullAlgorithm,
  cancelAlgorithm,
  highWaterMark,
  sizeAlgorithm
) {
  // Assert: stream._controller === undefined

  controller._stream = stream;

  resetQueue(controller);

  controller._started = false;
  controller._closeRequested = false;
  controller._pullAgain = false;
  controller._pulling = false;

  controller._strategySizeAlgorithm = sizeAlgorithm;
  controller._strategyHWM = highWaterMark;

  controller._pullAlgorithm = pullAlgorithm;
  controller._cancelAlgorithm = cancelAlgorithm;

  stream._controller = controller;

  const startResult = startAlgorithm();
  Promise.resolve(startResult).then(
    () => {
      controller._started = true;

      // Assert: controller._pulling === false
      // Assert: controller._pullAgain === false

      readableStreamDefaultControllerCallPullIfNeeded(controller);
    },
    r => {
      readableStreamDefaultControllerError(controller, r);
    }
  );
}

function setUpReadableStreamDefaultControllerFromUnderlyingSource(
  globalObject,
  stream,
  underlyingSource,
  underlyingSourceDict,
  highWaterMark,
  sizeAlgorithm
) {
  const controller = ReadableStreamDefaultController.new(globalObject);

  /* eslint-disable func-style */
  let startAlgorithm = () => undefined;
  let pullAlgorithm = () => Promise.resolve();
  let cancelAlgorithm = () => Promise.resolve();
  /* eslint-enable func-style */

  if ("start" in underlyingSourceDict) {
    startAlgorithm = () => underlyingSourceDict.start.call(underlyingSource, controller);
  }
  if ("pull" in underlyingSourceDict) {
    pullAlgorithm = () => underlyingSourceDict.pull.call(underlyingSource, controller);
  }
  if ("cancel" in underlyingSourceDict) {
    cancelAlgorithm = reason => underlyingSourceDict.cancel.call(underlyingSource, reason);
  }

  setUpReadableStreamDefaultController(
    stream,
    controller,
    startAlgorithm,
    pullAlgorithm,
    cancelAlgorithm,
    highWaterMark,
    sizeAlgorithm
  );
}

// Byte stream controllers

function readableByteStreamControllerCallPullIfNeeded(controller) {
  const shouldPull = readableByteStreamControllerShouldCallPull(controller);
  if (shouldPull === false) {
    return;
  }

  if (controller._pulling === true) {
    controller._pullAgain = true;
    return;
  }

  // Assert: controller._pullAgain === false

  controller._pulling = true;

  // TODO: Test controller argument
  const pullPromise = controller._pullAlgorithm();
  pullPromise.then(
    () => {
      controller._pulling = false;

      if (controller._pullAgain === true) {
        controller._pullAgain = false;
        readableByteStreamControllerCallPullIfNeeded(controller);
      }
    },
    e => {
      readableByteStreamControllerError(controller, e);
    }
  );
}

function readableByteStreamControllerClearAlgorithms(controller) {
  controller._pullAlgorithm = undefined;
  controller._cancelAlgorithm = undefined;
}

function readableByteStreamControllerClearPendingPullIntos(controller) {
  readableByteStreamControllerInvalidateBYOBRequest(controller);
  controller._pendingPullIntos = [];
}

function readableByteStreamControllerClose(controller) {
  const stream = controller._stream;

  if (controller._closeRequested === true || stream._state !== "readable") {
    return;
  }

  if (controller._queueTotalSize > 0) {
    controller._closeRequested = true;

    return;
  }

  if (controller._pendingPullIntos.length > 0) {
    const firstPendingPullInto = controller._pendingPullIntos[0];
    if (firstPendingPullInto.bytesFilled > 0) {
      const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
      readableByteStreamControllerError(controller, e);

      throw e;
    }
  }

  readableByteStreamControllerClearAlgorithms(controller);
  readableStreamClose(stream);
}

function readableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
  // Assert: stream._state !== "errored"

  let done = false;
  if (stream._state === "closed") {
    // Assert: pullIntoDescriptor.bytesFilled === 0
    done = true;
  }

  const filledView = readableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
  if (pullIntoDescriptor.readerType === "default") {
    readableStreamFulfillReadRequest(stream, filledView, done);
  } else {
    // Assert: pullIntoDescriptor.readerType === "byob"
    readableStreamFulfillReadIntoRequest(stream, filledView, done);
  }
}

function readableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
  const { bytesFilled } = pullIntoDescriptor;
  const { elementSize } = pullIntoDescriptor;

  // Assert: bytesFilled <= pullIntoDescriptor.byteLength
  // Assert: bytesFilled % elementSize === 0

  const buffer = transferArrayBuffer(pullIntoDescriptor.buffer);
  return new pullIntoDescriptor.ViewConstructor(buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
}

function readableByteStreamControllerEnqueue(globalObject, controller, chunk) {
  const stream = controller._stream;

  if (controller._closeRequested === true || stream._state !== "readable") {
    return;
  }

  const { buffer } = chunk;
  const { byteOffset } = chunk;
  const { byteLength } = chunk;
  if (isDetachedBuffer(buffer) === true) {
    throw new TypeError("chunk's buffer is detached and so cannot be enqueued");
  }
  const transferredBuffer = transferArrayBuffer(buffer);

  if (controller._pendingPullIntos.length > 0) {
    const firstPendingPullInto = controller._pendingPullIntos[0];
    if (isDetachedBuffer(firstPendingPullInto.buffer) === true) {
      throw new TypeError(
        "The BYOB request's buffer has been detached and so cannot be filled with an enqueued chunk"
      );
    }
    firstPendingPullInto.buffer = transferArrayBuffer(firstPendingPullInto.buffer);
  }

  readableByteStreamControllerInvalidateBYOBRequest(controller);

  if (readableStreamHasDefaultReader(stream) === true) {
    if (readableStreamGetNumReadRequests(stream) === 0) {
      readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    } else {
      // Assert: controller._queue.length === 0

      const transferredView = new globalObject.Uint8Array(transferredBuffer, byteOffset, byteLength);
      readableStreamFulfillReadRequest(stream, transferredView, false);
    }
  } else if (readableStreamHasBYOBReader(stream) === true) {
    // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
    readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
  } else {
    // Assert: isReadableStreamLocked(stream) === false
    readableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
  }

  readableByteStreamControllerCallPullIfNeeded(controller);
}

function readableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
  controller._queue.push({ buffer, byteOffset, byteLength });
  controller._queueTotalSize += byteLength;
}

function readableByteStreamControllerError(controller, e) {
  const stream = controller._stream;

  if (stream._state !== "readable") {
    return;
  }

  readableByteStreamControllerClearPendingPullIntos(controller);

  resetQueue(controller);
  readableByteStreamControllerClearAlgorithms(controller);
  readableStreamError(stream, e);
}

function readableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
  // Assert: controller._pendingPullIntos.length === 0 || controller._pendingPullIntos[0] === pullIntoDescriptor
  // Assert: controller._byobRequest === null
  pullIntoDescriptor.bytesFilled += size;
}

function readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
  const { elementSize } = pullIntoDescriptor;

  const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;

  const maxBytesToCopy = Math.min(
    controller._queueTotalSize,
    pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled
  );
  const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
  const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;

  let totalBytesToCopyRemaining = maxBytesToCopy;
  let ready = false;
  if (maxAlignedBytes > currentAlignedBytes) {
    totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
    ready = true;
  }

  const queue = controller._queue;

  while (totalBytesToCopyRemaining > 0) {
    const headOfQueue = queue[0];

    const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);

    const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
    copyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);

    if (headOfQueue.byteLength === bytesToCopy) {
      queue.shift();
    } else {
      headOfQueue.byteOffset += bytesToCopy;
      headOfQueue.byteLength -= bytesToCopy;
    }
    controller._queueTotalSize -= bytesToCopy;

    readableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);

    totalBytesToCopyRemaining -= bytesToCopy;
  }

  if (ready === false) {
    // Assert: controller._queueTotalSize === 0
    // Assert: pullIntoDescriptor.bytesFilled > 0
    // Assert: pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize
  }

  return ready;
}

function readableByteStreamControllerGetDesiredSize(controller) {
  const state = controller._stream._state;

  if (state === "errored") {
    return null;
  }
  if (state === "closed") {
    return 0;
  }

  return controller._strategyHWM - controller._queueTotalSize;
}

function readableByteStreamControllerHandleQueueDrain(controller) {
  // Assert: controller._stream._state === "readable"

  if (controller._queueTotalSize === 0 && controller._closeRequested === true) {
    readableByteStreamControllerClearAlgorithms(controller);
    readableStreamClose(controller._stream);
  } else {
    readableByteStreamControllerCallPullIfNeeded(controller);
  }
}

function readableByteStreamControllerInvalidateBYOBRequest(controller) {
  if (controller._byobRequest === null) {
    return;
  }

  controller._byobRequest._controller = undefined;
  controller._byobRequest._view = null;
  controller._byobRequest = null;
}

function readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
  // Assert: controller._closeRequested === false

  while (controller._pendingPullIntos.length > 0) {
    if (controller._queueTotalSize === 0) {
      return;
    }

    const pullIntoDescriptor = controller._pendingPullIntos[0];

    if (readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) === true) {
      readableByteStreamControllerShiftPendingPullInto(controller);

      readableByteStreamControllerCommitPullIntoDescriptor(
        controller._stream,
        pullIntoDescriptor
      );
    }
  }
}

function readableByteStreamControllerPullInto(controller, view, readIntoRequest) {
  const stream = controller._stream;

  let elementSize = 1;
  if (view.constructor !== DataView) {
    elementSize = view.constructor.BYTES_PER_ELEMENT;
  }

  const ctor = view.constructor;

  let buffer;
  try {
    buffer = transferArrayBuffer(view.buffer);
  } catch (e) {
    readIntoRequest.errorSteps(e);
    return;
  }

  const pullIntoDescriptor = {
    buffer,
    bufferByteLength: buffer.byteLength,
    byteOffset: view.byteOffset,
    byteLength: view.byteLength,
    bytesFilled: 0,
    elementSize,
    ViewConstructor: ctor,
    readerType: "byob"
  };

  if (controller._pendingPullIntos.length > 0) {
    controller._pendingPullIntos.push(pullIntoDescriptor);

    // No readableByteStreamControllerCallPullIfNeeded() call since:
    // - No change happens on desiredSize
    // - The source has already been notified of that there's at least 1 pending read(view)

    readableStreamAddReadIntoRequest(stream, readIntoRequest);
    return;
  }

  if (stream._state === "closed") {
    const emptyView = new view.constructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
    readIntoRequest.closeSteps(emptyView);
    return;
  }

  if (controller._queueTotalSize > 0) {
    if (readableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) === true) {
      const filledView = readableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);

      readableByteStreamControllerHandleQueueDrain(controller);

      readIntoRequest.chunkSteps(filledView);
      return;
    }

    if (controller._closeRequested === true) {
      const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
      readableByteStreamControllerError(controller, e);

      readIntoRequest.errorSteps(e);
      return;
    }
  }

  controller._pendingPullIntos.push(pullIntoDescriptor);

  readableStreamAddReadIntoRequest(stream, readIntoRequest);
  readableByteStreamControllerCallPullIfNeeded(controller);
}

function readableByteStreamControllerRespond(controller, bytesWritten) {
  // Assert: controller._pendingPullIntos.length > 0

  const firstDescriptor = controller._pendingPullIntos[0];
  const state = controller._stream._state;

  if (state === "closed") {
    if (bytesWritten !== 0) {
      throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
    }
  } else {
    // Assert: state === "readable"
    if (bytesWritten === 0) {
      throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
    }
    if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
      throw new RangeError("bytesWritten out of range");
    }
  }

  firstDescriptor.buffer = transferArrayBuffer(firstDescriptor.buffer);

  readableByteStreamControllerRespondInternal(controller, bytesWritten);
}

// This abstract operation takes an argument it uses only for assertions
// eslint-disable-next-line no-unused-vars
function readableByteStreamControllerRespondInClosedState(controller, _firstDescriptor) {
  // Assert: firstDescriptor.bytesFilled === 0

  const stream = controller._stream;
  if (readableStreamHasBYOBReader(stream) === true) {
    while (readableStreamGetNumReadIntoRequests(stream) > 0) {
      const pullIntoDescriptor = readableByteStreamControllerShiftPendingPullInto(controller);
      readableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
    }
  }
}

function readableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
  // Assert: pullIntoDescriptor.bytesFilled + bytesWritten <= pullIntoDescriptor.byteLength

  readableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);

  if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
    return;
  }

  readableByteStreamControllerShiftPendingPullInto(controller);

  const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
  if (remainderSize > 0) {
    const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
    const remainder = pullIntoDescriptor.buffer.slice(end - remainderSize, end);
    readableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
  }

  pullIntoDescriptor.bytesFilled -= remainderSize;
  readableByteStreamControllerCommitPullIntoDescriptor(controller._stream, pullIntoDescriptor);

  readableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
}

function readableByteStreamControllerRespondInternal(controller, bytesWritten) {
  const firstDescriptor = controller._pendingPullIntos[0];
  // Assert: canTransferArrayBuffer(firstDescriptor.buffer) === true

  readableByteStreamControllerInvalidateBYOBRequest(controller);

  const state = controller._stream._state;
  if (state === "closed") {
    // Assert: bytesWritten === 0
    readableByteStreamControllerRespondInClosedState(controller, firstDescriptor);
  } else {
    // Assert: state === "readable"
    // Assert: bytesWritten > 0
    readableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
  }

  readableByteStreamControllerCallPullIfNeeded(controller);
}

function readableByteStreamControllerRespondWithNewView(controller, view) {
  // Assert: controller._pendingPullIntos.length > 0
  // Assert: isDetachedBuffer(view.buffer) === false

  const firstDescriptor = controller._pendingPullIntos[0];
  const state = controller._stream._state;

  if (state === "closed") {
    if (view.byteLength !== 0) {
      throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
    }
  } else {
    // Assert: state === "readable"
    // eslint-disable-next-line no-lonely-if
    if (view.byteLength === 0) {
      throw new TypeError(
        "The view's length must be greater than 0 when calling respondWithNewView() on a readable stream"
      );
    }
  }

  if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
    throw new RangeError("The region specified by view does not match byobRequest");
  }
  if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
    throw new RangeError("The buffer of view has different capacity than byobRequest");
  }
  if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
    throw new RangeError("The region specified by view is larger than byobRequest");
  }

  firstDescriptor.buffer = transferArrayBuffer(view.buffer);

  readableByteStreamControllerRespondInternal(controller, view.byteLength);
}

function readableByteStreamControllerShiftPendingPullInto(controller) {
  // Assert: controller._byobRequest === null
  const descriptor = controller._pendingPullIntos.shift();
  return descriptor;
}

function readableByteStreamControllerShouldCallPull(controller) {
  const stream = controller._stream;

  if (stream._state !== "readable") {
    return false;
  }

  if (controller._closeRequested === true) {
    return false;
  }

  if (controller._started === false) {
    return false;
  }

  if (readableStreamHasDefaultReader(stream) === true && readableStreamGetNumReadRequests(stream) > 0) {
    return true;
  }

  if (readableStreamHasBYOBReader(stream) === true && readableStreamGetNumReadIntoRequests(stream) > 0) {
    return true;
  }

  const desiredSize = readableByteStreamControllerGetDesiredSize(controller);
  // Assert: desiredSize !== null
  if (desiredSize > 0) {
    return true;
  }

  return false;
}

function setUpReadableByteStreamController(
  globalObject,
  stream,
  controller,
  startAlgorithm,
  pullAlgorithm,
  cancelAlgorithm,
  highWaterMark,
  autoAllocateChunkSize
) {
  // Assert: stream._controller === undefined
  if (autoAllocateChunkSize !== undefined) {
    // Assert: Number.isInteger(autoAllocateChunkSize) === true
    // Assert: autoAllocateChunkSize > 0
  }

  controller._globalObject = globalObject;
  controller._stream = stream;

  controller._pullAgain = false;
  controller._pulling = false;

  controller._byobRequest = null;

  resetQueue(controller);

  controller._closeRequested = false;
  controller._started = false;

  controller._strategyHWM = highWaterMark;

  controller._pullAlgorithm = pullAlgorithm;
  controller._cancelAlgorithm = cancelAlgorithm;

  controller._autoAllocateChunkSize = autoAllocateChunkSize;

  controller._pendingPullIntos = [];

  stream._controller = controller;

  const startResult = startAlgorithm();
  Promise.resolve(startResult).then(
    () => {
      controller._started = true;

      // Assert: controller._pulling === false
      // Assert: controller._pullAgain === false

      readableByteStreamControllerCallPullIfNeeded(controller);
    },
    r => {
      readableByteStreamControllerError(controller, r);
    }
  );
}

function setUpReadableByteStreamControllerFromUnderlyingSource(
  globalObject,
  stream,
  underlyingSource,
  underlyingSourceDict,
  highWaterMark
) {
  const controller = ReadableByteStreamController.new(globalObject);

  /* eslint-disable func-style */
  let startAlgorithm = () => undefined;
  let pullAlgorithm = () => Promise.resolve();
  let cancelAlgorithm = () => Promise.resolve();
  /* eslint-enable func-style */

  if ("start" in underlyingSourceDict) {
    startAlgorithm = () => underlyingSourceDict.start.call(underlyingSource, controller);
  }
  if ("pull" in underlyingSourceDict) {
    pullAlgorithm = () => underlyingSourceDict.pull.call(underlyingSource, controller);
  }
  if ("cancel" in underlyingSourceDict) {
    cancelAlgorithm = reason => underlyingSourceDict.cancel.call(underlyingSource, reason);
  }

  const { autoAllocateChunkSize } = underlyingSourceDict;
  if (autoAllocateChunkSize === 0) {
    throw new TypeError("autoAllocateChunkSize must be greater than 0");
  }

  setUpReadableByteStreamController(
    globalObject,
    stream,
    controller,
    startAlgorithm,
    pullAlgorithm,
    cancelAlgorithm,
    highWaterMark,
    autoAllocateChunkSize
  );
}
