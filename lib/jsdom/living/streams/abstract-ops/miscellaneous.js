"use strict";

exports.isNonNegativeNumber = v => {
  if (typeof v !== "number") {
    return false;
  }

  if (Number.isNaN(v)) {
    return false;
  }

  if (v < 0) {
    return false;
  }

  return true;
};
