"use strict";

const idlUtils = require("../generated/utils.js");

exports.implementation = class PluginArray {
  refresh() {}

  get length() {
    return 0;
  }

  item() {
    return null;
  }

  namedItem() {
    return null;
  }

  get [idlUtils.supportedPropertyIndices]() {
    return [];
  }

  get [idlUtils.supportedPropertyNames]() {
    return [];
  }
};
