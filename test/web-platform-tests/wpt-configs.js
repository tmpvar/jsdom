"use strict";
/* eslint-disable global-require */
const fs = require("fs");
const path = require("path");

exports.configPaths = {
  default: path.resolve(__dirname, "wpt-config.json"),
  toUpstream: path.resolve(__dirname, "tuwpt-config.json")
};

exports.configs = {
  default: JSON.parse(fs.readFileSync(exports.configPaths.default, { encoding: "utf-8" })),
  toUpstream: JSON.parse(fs.readFileSync(exports.configPaths.toUpstream, { encoding: "utf-8" }))
};
