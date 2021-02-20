"use strict";
const { mixin } = require("../../utils.js");
const { domSymbolTree } = require("../helpers/internal-constants.js");
const NODE_TYPE = require("../node-type.js");
const NodeImpl = require("./Node-impl.js").implementation;
const NonElementParentNodeImpl = require("./NonElementParentNode-impl.js").implementation;
const ParentNodeImpl = require("./ParentNode-impl.js").implementation;
const idlUtils = require("../generated/utils.js");

class DocumentFragmentImpl extends NodeImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, {
      ownerDocument: idlUtils.implForWrapper(globalObject._document),
      ...privateData
    });

    const { host } = privateData;
    this._host = host;

    this.nodeType = NODE_TYPE.DOCUMENT_FRAGMENT_NODE;
  }

  // This is implemented separately for Document (which has a _ids cache) and DocumentFragment (which does not).
  getElementById(id) {
    if (id === "") {
      return null;
    }

    for (const descendant of domSymbolTree.treeIterator(this)) {
      if (descendant.nodeType === NODE_TYPE.ELEMENT_NODE && descendant.getAttributeNS(null, "id") === id) {
        return descendant;
      }
    }

    return null;
  }
}

mixin(DocumentFragmentImpl.prototype, NonElementParentNodeImpl.prototype);
mixin(DocumentFragmentImpl.prototype, ParentNodeImpl.prototype);

module.exports = {
  implementation: DocumentFragmentImpl
};
