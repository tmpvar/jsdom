"use strict";

exports.extractHighWaterMark = (strategy, defaultHWM) => {
  if (!("highWaterMark" in strategy)) {
    return defaultHWM;
  }

  const { highWaterMark } = strategy;
  if (Number.isNaN(highWaterMark) || highWaterMark < 0) {
    throw new RangeError("Invalid highWaterMark");
  }

  return highWaterMark;
};

exports.extractSizeAlgorithm = strategy => {
  const { size } = strategy;

  if (!size) {
    return () => 1;
  }

  // This is silly, but more obviously matches the spec (which distinguishes between algorithms and JS functions).
  return chunk => size(chunk);
};
