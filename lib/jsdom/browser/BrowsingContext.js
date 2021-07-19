"use strict";

const idlUtils = require("../living/generated/utils");

// https://html.spec.whatwg.org/#windows
class BrowsingContext {
  // readonly windowProxy: WindowProxy
  // readonly sessionHistory: SessionHistory

  // create a new browsing context
  constructor() {
    this.windowProxy = new WindowProxy();
    this.sessionHistory = new SessionHistory();

    // 2. Call the JavaScript InitializeHostDefinedRealm() abstract operation
    const window = new Window();
    // TODO: InitializeHostDefinedRealm({globalObject: window, globalThisValue: this.windowProxy, relmExecutionContext: new JavaScriptExecutionContext})


    this.windowProxy = windowProxy;
    // https://html.spec.whatwg.org/#session-history
    this._sessionHistory = [{
      document: idlUtils.implForWrapper(this._document),
      url: idlUtils.implForWrapper(this._document)._URL,
      stateObject: null
    }];
    this._currentSessionHistoryEntryIndex = 0;
  }

  // A browsing context's active document is its WindowProxy object's [[Window]] internal slot value's associated Document.
  getActiveDocument() {
    return this.windowProxy.document;
  }
  setActiveDocument(document, window) {
    if (!window) {
      // If window is not given, let window be document's relevant global object.
      window = idlUtils.implForWrapper(document)._global;
    }
    // Set browsingContext's WindowProxy object's [[Window]] internal slot value to window.
    // Set window's associated Document to document.
    // Set window's relevant settings object's execution ready flag.
  }

  getCreatorBrowsingContext() {
    // If a browsing context has a parent browsing context, then that is its creator browsing context.
    if (this.parentBrowsingContext) {
      return this.parentBrowsingContext;
    }
    // Otherwise, if the browsing context has an opener browsing context, then that is its creator browsing context.
    if (this.openerBrowsingContext) {
      return this.openerBrowsingContext;
    }
    // Otherwise, the browsing context has no creator browsing context.
    return null;
  }
}

module.exports = BrowsingContext;
