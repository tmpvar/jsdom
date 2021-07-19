"use strict";
const { isNonNegativeNumber } = require("./miscellaneous.js");

exports.dequeueValue = container => {
  // Assert: "_queue" in container && "_queueTotalSize" in container
  // Assert: container._queue.length > 0

  const pair = container._queue.shift();
  container._queueTotalSize -= pair.size;
  if (container._queueTotalSize < 0) {
    container._queueTotalSize = 0;
  }

  return pair.value;
};

exports.enqueueValueWithSize = (container, value, size) => {
  // Assert: "_queue" in container && "_queueTotalSize" in container

  if (!isNonNegativeNumber(size)) {
    throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
  }
  if (size === Infinity) {
    throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
  }

  container._queue.push({ value, size });
  container._queueTotalSize += size;
};

exports.peekQueueValue = container => {
  // Assert: "_queue" in container && "_queueTotalSize" in container
  // Assert: container._queue.length > 0

  const pair = container._queue[0];
  return pair.value;
};

exports.resetQueue = container => {
  container._queue = [];
  container._queueTotalSize = 0;
};
