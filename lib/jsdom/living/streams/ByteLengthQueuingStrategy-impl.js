"use strict";

const sizeFunctionWeakMap = new WeakMap();

exports.implementation = class ByteLengthQueuingStrategyImpl {
  constructor(globalObject, [{ highWaterMark }]) {
    this._globalObject = globalObject;
    this.highWaterMark = highWaterMark;
  }

  get size() {
    initializeSizeFunction(this._globalObject);
    return sizeFunctionWeakMap.get(this._globalObject);
  }
};

function initializeSizeFunction(globalObject) {
  if (sizeFunctionWeakMap.has(globalObject)) {
    return;
  }

  // We need to set the 'name' property:
  // eslint-disable-next-line prefer-arrow-callback
  sizeFunctionWeakMap.set(globalObject, function size(chunk) {
    return chunk.byteLength;
  });
}
