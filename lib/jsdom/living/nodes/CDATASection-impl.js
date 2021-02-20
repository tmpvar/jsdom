"use strict";

const TextImpl = require("./Text-impl.js").implementation;
const NODE_TYPE = require("../node-type.js");

class CDATASectionImpl extends TextImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);

    this.nodeType = NODE_TYPE.CDATA_SECTION_NODE;
  }
}

module.exports = {
  implementation: CDATASectionImpl
};
