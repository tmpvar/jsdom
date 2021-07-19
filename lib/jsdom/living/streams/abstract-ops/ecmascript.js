"use strict";

exports.createArrayFromList = elements => {
  // We use arrays to represent lists, so this is basically a no-op.
  // Do a slice though just in case we happen to depend on the unique-ness.
  return elements.slice();
};

exports.copyDataBlockBytes = (dest, destOffset, src, srcOffset, n) => {
  new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
};

// Not implemented correctly
exports.transferArrayBuffer = O => {
  // Assert: !exports.isDetachedBuffer(O)
  return O;
};

// Not implemented correctly
exports.canTransferArrayBuffer = O => {
  return !exports.isDetachedBuffer(O);
};

// Not implemented correctly
exports.isDetachedBuffer = () => {
  return false;
};
