"use strict";
const { mixin } = require("../../utils.js");
const NavigatorIDImpl = require("./NavigatorID-impl.js").implementation;
const NavigatorLanguageImpl = require("./NavigatorLanguage-impl.js").implementation;
const NavigatorOnLineImpl = require("./NavigatorOnLine-impl.js").implementation;
const NavigatorCookiesImpl = require("./NavigatorCookies-impl.js").implementation;
const NavigatorPluginsImpl = require("./NavigatorPlugins-impl.js").implementation;
const NavigatorConcurrentHardwareImpl = require("./NavigatorConcurrentHardware-impl.js").implementation;

class NavigatorImpl {
  constructor(globalObject, args, privateData) {
    this._globalObject = globalObject;
    this.userAgent = privateData.userAgent;
    this.languages = Object.freeze(["en-US", "en"]);
  }
}

mixin(NavigatorImpl.prototype, NavigatorIDImpl.prototype);
mixin(NavigatorImpl.prototype, NavigatorLanguageImpl.prototype);
mixin(NavigatorImpl.prototype, NavigatorOnLineImpl.prototype);
mixin(NavigatorImpl.prototype, NavigatorCookiesImpl.prototype);
mixin(NavigatorImpl.prototype, NavigatorPluginsImpl.prototype);
mixin(NavigatorImpl.prototype, NavigatorConcurrentHardwareImpl.prototype);

exports.implementation = NavigatorImpl;
