"use strict";

const { PromiseCapability } = require("./helpers/promises.js");
const { extractHighWaterMark, extractSizeAlgorithm } = require("./abstract-ops/queuing-strategy.js");
const aos = require("./abstract-ops/transform-streams.js");

const Transformer = require("../generated/Transformer.js");

exports.implementation = class TransformStreamImpl {
  constructor(globalObject, [transformer, writableStrategy, readableStrategy]) {
    this._globalObject = globalObject;
    if (transformer === undefined) {
      transformer = null;
    }
    const transformerDict = Transformer.convert(transformer);
    if ("readableType" in transformerDict) {
      throw new RangeError("Invalid readableType specified");
    }
    if ("writableType" in transformerDict) {
      throw new RangeError("Invalid writableType specified");
    }

    const readableHighWaterMark = extractHighWaterMark(readableStrategy, 0);
    const readableSizeAlgorithm = extractSizeAlgorithm(readableStrategy);
    const writableHighWaterMark = extractHighWaterMark(writableStrategy, 1);
    const writableSizeAlgorithm = extractSizeAlgorithm(writableStrategy);

    const startPromiseCap = new PromiseCapability();

    aos.initializeTransformStream(
      this._globalObject,
      this,
      startPromiseCap.promise,
      writableHighWaterMark,
      writableSizeAlgorithm,
      readableHighWaterMark,
      readableSizeAlgorithm
    );
    aos.setUpTransformStreamDefaultControllerFromTransformer(this._globalObject, this, transformer, transformerDict);

    if ("start" in transformerDict) {
      startPromiseCap.resolve(transformerDict.start.call(transformer, this._controller));
    } else {
      startPromiseCap.resolve();
    }
  }

  get readable() {
    return this._readable;
  }

  get writable() {
    return this._writable;
  }
};
