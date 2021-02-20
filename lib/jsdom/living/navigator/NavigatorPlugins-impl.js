"use strict";

const PluginArray = require("../generated/PluginArray.js");
const MimeTypeArray = require("../generated/MimeTypeArray.js");

exports.implementation = class NavigatorPluginsImpl {
  get plugins() {
    return PluginArray.create(this._globalObject);
  }

  get mimeTypes() {
    return MimeTypeArray.create(this._globalObject);
  }

  javaEnabled() {
    return false;
  }
};
