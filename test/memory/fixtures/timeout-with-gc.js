"use strict";

const { JSDOM } = require("../../..");
const { window } = new JSDOM("");

function registerTimerWithClosure() {
  const hugeArray = Array(5000000)
    .fill(0)
    .map((_, idx) => idx);

  window.setTimeout(() => hugeArray, 10);
}

global.gc();
const headTotalBeforeTimer = process.memoryUsage().heapTotal;
registerTimerWithClosure();
global.gc();

setTimeout(() => {
  global.gc();
  const headTotalAfterTimer = process.memoryUsage().heapTotal;
  console.log(`${Math.floor((headTotalAfterTimer - headTotalBeforeTimer) / 1024 / 1024)}`);
}, 20);
