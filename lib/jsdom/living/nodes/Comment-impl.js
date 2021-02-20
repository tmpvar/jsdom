"use strict";

const CharacterDataImpl = require("./CharacterData-impl.js").implementation;

const NODE_TYPE = require("../node-type.js");

class CommentImpl extends CharacterDataImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, {
      data: args[0],
      ...privateData
    });

    this.nodeType = NODE_TYPE.COMMENT_NODE;
  }
}

module.exports = {
  implementation: CommentImpl
};
