"use strict";

const { mixin } = require("../../utils.js");
const SVGNumber = require("../generated/SVGNumber.js");
const SVGGraphicsElementImpl = require("./SVGGraphicsElement-impl.js").implementation;
const WindowEventHandlersImpl = require("./WindowEventHandlers-impl.js").implementation;
const { domSymbolTree } = require("../helpers/internal-constants.js");
const { ELEMENT_NODE } = require("../node-type.js");

class SVGSVGElementImpl extends SVGGraphicsElementImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);
    this._proxyWindowEventsToWindow();
  }

  createSVGNumber() {
    return SVGNumber.createImpl(this._globalObject, [], {});
  }

  getElementById(elementId) {
    // TODO: optimize with _ids caching trick; see Document class.
    for (const node of domSymbolTree.treeIterator(this)) {
      if (node.nodeType === ELEMENT_NODE && node.getAttributeNS(null, "id") === elementId) {
        return node;
      }
    }
    return null;
  }

  suspendRedraw() {
    return 1;
  }
  unsuspendRedraw() {}
  unsuspendRedrawAll() {}
  forceRedraw() {}
}

mixin(SVGSVGElementImpl.prototype, WindowEventHandlersImpl.prototype);

module.exports = {
  implementation: SVGSVGElementImpl
};
