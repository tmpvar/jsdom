"use strict";
const { mixin } = require("../../utils.js");
const NodeImpl = require("./Node-impl.js").implementation;
const ChildNodeImpl = require("./ChildNode-impl.js").implementation;

const NODE_TYPE = require("../node-type.js");

class DocumentTypeImpl extends NodeImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);

    this.nodeType = NODE_TYPE.DOCUMENT_TYPE_NODE;

    this.name = privateData.name;
    this.publicId = privateData.publicId;
    this.systemId = privateData.systemId;
  }
}

mixin(DocumentTypeImpl.prototype, ChildNodeImpl.prototype);

module.exports = {
  implementation: DocumentTypeImpl
};
