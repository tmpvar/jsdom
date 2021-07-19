"use strict";

/**
  * This test script is NOT included in index.js. It is ran from `yarn test`
  * directly to prevent the contamination of gloablThis in the Mocha test
  * environment. The test passes if this script executes without error.
 */

// Attempts to polyfill AggregateError.
global.AggregateError = class AggregateError extends Error {};
const { JSDOM } = require("../..");
// eslint-disable-next-line no-new
new JSDOM("", { runScripts: "dangerously" });
