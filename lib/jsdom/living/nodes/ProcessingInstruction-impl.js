"use strict";

const CharacterDataImpl = require("./CharacterData-impl.js").implementation;

const NODE_TYPE = require("../node-type.js");

class ProcessingInstructionImpl extends CharacterDataImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);

    this.nodeType = NODE_TYPE.PROCESSING_INSTRUCTION_NODE;
    this._target = privateData.target;
  }

  get target() {
    return this._target;
  }
}

module.exports = {
  implementation: ProcessingInstructionImpl
};
