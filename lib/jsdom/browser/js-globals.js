"use strict";
const vm = require("vm");
const assert = require("assert");

// Creates a list of globals from the JS environment (not the web), so that Window.js can alias them when necessary.
// The generated list should match https://tc39.es/ecma262/#sec-global-object, to the extent V8 implements the spec.

const globals = vm.runInNewContext("Object.getOwnPropertyDescriptors(this)");

// I guess VM contexts have a console, from V8? That isn't a JS global and JSDOM will install its own, so don't include
// that.
delete globals.console;

// All JS globals are data properties as of the time of this writing. If that becomes false then we need to adapt the
// code in Window.js.
for (const [key, global] of Object.entries(globals)) {
  assert("value" in global && !("get" in global) && !("set" in global), `${key} was unexpectedly a non-data property`);

  // We don't want to serialize value; Window.js will get it afresh, and having it in the JSON is confusing.
  delete global.value;
}

module.exports = globals;
