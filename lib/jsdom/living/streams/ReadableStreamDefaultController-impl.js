"use strict";

const { CancelSteps, PullSteps } = require("./abstract-ops/internal-methods.js");
const { dequeueValue, resetQueue } = require("./abstract-ops/queue-with-sizes.js");
const aos = require("./abstract-ops/readable-streams.js");

exports.implementation = class ReadableStreamDefaultControllerImpl {
  get desiredSize() {
    return aos.readableStreamDefaultControllerGetDesiredSize(this);
  }

  close() {
    if (aos.readableStreamDefaultControllerCanCloseOrEnqueue(this) === false) {
      throw new TypeError("The stream is not in a state that permits close");
    }

    aos.readableStreamDefaultControllerClose(this);
  }

  enqueue(chunk) {
    if (aos.readableStreamDefaultControllerCanCloseOrEnqueue(this) === false) {
      throw new TypeError("The stream is not in a state that permits enqueue");
    }

    return aos.readableStreamDefaultControllerEnqueue(this, chunk);
  }

  error(e) {
    aos.readableStreamDefaultControllerError(this, e);
  }

  [CancelSteps](reason) {
    resetQueue(this);
    const result = this._cancelAlgorithm(reason);
    aos.readableStreamDefaultControllerClearAlgorithms(this);
    return result;
  }

  [PullSteps](readRequest) {
    const stream = this._stream;

    if (this._queue.length > 0) {
      const chunk = dequeueValue(this);

      if (this._closeRequested === true && this._queue.length === 0) {
        aos.readableStreamDefaultControllerClearAlgorithms(this);
        aos.readableStreamClose(stream);
      } else {
        aos.readableStreamDefaultControllerCallPullIfNeeded(this);
      }

      readRequest.chunkSteps(chunk);
    } else {
      aos.readableStreamAddReadRequest(stream, readRequest);
      aos.readableStreamDefaultControllerCallPullIfNeeded(this);
    }
  }
};
