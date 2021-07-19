"use strict";
const { isDetachedBuffer } = require("./abstract-ops/ecmascript.js");
const aos = require("./abstract-ops/readable-streams.js");

exports.implementation = class ReadableStreamBYOBRequestImpl {
  get view() {
    return this._view;
  }

  respond(bytesWritten) {
    if (this._controller === undefined) {
      throw new TypeError("This BYOB request has been invalidated");
    }

    if (isDetachedBuffer(this._view.buffer) === true) {
      throw new TypeError("The BYOB request's buffer has been detached and so cannot be used as a response");
    }

    // Assert: this._view.byteLength > 0
    // Assert: this._view.buffer.byteLength > 0

    aos.readableByteStreamControllerRespond(this._controller, bytesWritten);
  }

  respondWithNewView(view) {
    if (this._controller === undefined) {
      throw new TypeError("This BYOB request has been invalidated");
    }

    if (isDetachedBuffer(view.buffer) === true) {
      throw new TypeError("The given view's buffer has been detached and so cannot be used as a response");
    }

    aos.readableByteStreamControllerRespondWithNewView(this._controller, view);
  }
};
