"use strict";
const { CancelSteps, PullSteps } = require("./abstract-ops/internal-methods.js");
const { resetQueue } = require("./abstract-ops/queue-with-sizes.js");
const aos = require("./abstract-ops/readable-streams.js");

const ReadableStreamBYOBRequest = require("../generated/ReadableStreamBYOBRequest.js");

exports.implementation = class ReadableByteStreamControllerImpl {
  get byobRequest() {
    if (this._byobRequest === null && this._pendingPullIntos.length > 0) {
      const firstDescriptor = this._pendingPullIntos[0];
      const view = new this._globalObject.Uint8Array(
        firstDescriptor.buffer,
        firstDescriptor.byteOffset + firstDescriptor.bytesFilled,
        firstDescriptor.byteLength - firstDescriptor.bytesFilled
      );

      const byobRequest = ReadableStreamBYOBRequest.new(this._globalObject);
      byobRequest._controller = this;
      byobRequest._view = view;
      this._byobRequest = byobRequest;
    }

    return this._byobRequest;
  }

  get desiredSize() {
    return aos.readableByteStreamControllerGetDesiredSize(this);
  }

  close() {
    if (this._closeRequested === true) {
      throw new TypeError("The stream has already been closed; do not close it again!");
    }

    const state = this._stream._state;
    if (state !== "readable") {
      throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
    }

    aos.readableByteStreamControllerClose(this);
  }

  enqueue(chunk) {
    if (chunk.byteLength === 0) {
      throw new TypeError("chunk must have non-zero byteLength");
    }
    if (chunk.buffer.byteLength === 0) {
      throw new TypeError("chunk's buffer must have non-zero byteLength");
    }

    if (this._closeRequested === true) {
      throw new TypeError("stream is closed or draining");
    }

    const state = this._stream._state;
    if (state !== "readable") {
      throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
    }

    aos.readableByteStreamControllerEnqueue(this._globalObject, this, chunk);
  }

  error(e) {
    aos.readableByteStreamControllerError(this, e);
  }

  [CancelSteps](reason) {
    aos.readableByteStreamControllerClearPendingPullIntos(this);

    resetQueue(this);

    const result = this._cancelAlgorithm(reason);
    aos.readableByteStreamControllerClearAlgorithms(this);
    return result;
  }

  [PullSteps](readRequest) {
    const stream = this._stream;
    // Assert: aos.readableStreamHasDefaultReader(stream) === true

    if (this._queueTotalSize > 0) {
      // Assert: aos.readableStreamGetNumReadRequests(stream) === 0

      const entry = this._queue.shift();
      this._queueTotalSize -= entry.byteLength;

      aos.readableByteStreamControllerHandleQueueDrain(this);

      const view = new this._globalObject.Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);

      readRequest.chunkSteps(view);
      return;
    }

    const autoAllocateChunkSize = this._autoAllocateChunkSize;
    if (autoAllocateChunkSize !== undefined) {
      let buffer;
      try {
        buffer = new this._globalObject.ArrayBuffer(autoAllocateChunkSize);
      } catch (bufferE) {
        readRequest.errorSteps(bufferE);
        return;
      }

      const pullIntoDescriptor = {
        buffer,
        bufferByteLength: autoAllocateChunkSize,
        byteOffset: 0,
        byteLength: autoAllocateChunkSize,
        bytesFilled: 0,
        elementSize: 1,
        ViewConstructor: this._globalObject.Uint8Array,
        readerType: "default"
      };

      this._pendingPullIntos.push(pullIntoDescriptor);
    }

    aos.readableStreamAddReadRequest(stream, readRequest);
    aos.readableByteStreamControllerCallPullIfNeeded(this);
  }
};
