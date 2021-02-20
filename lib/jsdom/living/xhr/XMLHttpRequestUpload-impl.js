"use strict";
const XMLHttpRequestEventTargetImpl = require("./XMLHttpRequestEventTarget-impl.js").implementation;

exports.implementation = class XMLHttpRequestUploadImpl extends XMLHttpRequestEventTargetImpl {};
