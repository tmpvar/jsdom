"use strict";
const { Canvas } = require("../../lib/jsdom/utils.js");

const hasCanvas = Boolean(Canvas);

exports.resolveReason = reason => {
  if (["fail-slow", "timeout", "flaky"].includes(reason) ||
    (["fail-with-canvas", "needs-canvas"].includes(reason) && !hasCanvas)) {
    return "skip";
  }

  if (reason === "fail" ||
    (reason === "fail-with-canvas" && hasCanvas)) {
    return "expect-fail";
  }

  return "run";
};
