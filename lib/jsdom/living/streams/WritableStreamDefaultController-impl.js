"use strict";

const aos = require("./abstract-ops/writable-streams.js");
const { AbortSteps, ErrorSteps } = require("./abstract-ops/internal-methods.js");
const { resetQueue } = require("./abstract-ops/queue-with-sizes.js");

exports.implementation = class WritableStreamDefaultControllerImpl {
  error(e) {
    const state = this._stream._state;

    if (state !== "writable") {
      // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
      // just treat it as a no-op.
      return;
    }

    aos.writableStreamDefaultControllerError(this, e);
  }

  [AbortSteps](reason) {
    const result = this._abortAlgorithm(reason);
    aos.writableStreamDefaultControllerClearAlgorithms(this);
    return result;
  }

  [ErrorSteps]() {
    resetQueue(this);
  }
};
