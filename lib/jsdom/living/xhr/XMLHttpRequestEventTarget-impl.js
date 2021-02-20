"use strict";
const EventTargetImpl = require("../events/EventTarget-impl.js").implementation;
const idlUtils = require("../generated/utils.js");
const { setupForSimpleEventAccessors } = require("../helpers/create-event-accessor.js");

const events = ["loadstart", "progress", "abort", "error", "load", "timeout", "loadend"];

class XMLHttpRequestEventTargetImpl extends EventTargetImpl {
  // TODO: remove this when we fix EventTargetImpl to use this._globalObject directly instead of using _ownerDocument.
  // https://github.com/jsdom/jsdom/issues/2780
  get _ownerDocument() {
    return idlUtils.implForWrapper(this._globalObject._document);
  }
}
setupForSimpleEventAccessors(XMLHttpRequestEventTargetImpl.prototype, events);

exports.implementation = XMLHttpRequestEventTargetImpl;
