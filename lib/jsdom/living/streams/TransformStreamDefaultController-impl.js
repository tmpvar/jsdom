"use strict";

const aos = require("./abstract-ops/transform-streams.js");
const rsAOs = require("./abstract-ops/readable-streams.js");

exports.implementation = class TransformStreamDefaultController {
  get desiredSize() {
    const readableController = this._stream._readable._controller;
    return rsAOs.readableStreamDefaultControllerGetDesiredSize(readableController);
  }

  enqueue(chunk) {
    aos.transformStreamDefaultControllerEnqueue(this, chunk);
  }

  error(reason) {
    aos.transformStreamDefaultControllerError(this, reason);
  }

  terminate() {
    aos.transformStreamDefaultControllerTerminate(this);
  }
};
