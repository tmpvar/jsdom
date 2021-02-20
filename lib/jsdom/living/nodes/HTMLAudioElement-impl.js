"use strict";

const HTMLMediaElementImpl = require("./HTMLMediaElement-impl.js").implementation;

class HTMLAudioElementImpl extends HTMLMediaElementImpl { }

module.exports = {
  implementation: HTMLAudioElementImpl
};
