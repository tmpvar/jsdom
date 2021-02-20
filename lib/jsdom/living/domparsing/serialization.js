"use strict";

const produceXMLSerialization = require("w3c-xmlserializer");
const parse5 = require("parse5");
const DOMException = require("domexception/webidl2js-wrapper");

const utils = require("../generated/utils.js");
const treeAdapter = require("./parse5-adapter-serialization.js");
const NODE_TYPE = require("../node-type.js");
const NAMESPACES = require("../helpers/namespaces.js");

function htmlSerialization(node) {
  if (
    node.nodeType === NODE_TYPE.ELEMENT_NODE &&
    node.namespaceURI === NAMESPACES.HTML_NS &&
    node.tagName === "TEMPLATE"
  ) {
    node = node.content;
  }

  return parse5.serialize(node, { treeAdapter });
}

module.exports.fragmentSerialization = (node, { requireWellFormed, globalObject }) => {
  const contextDocument =
    node.nodeType === NODE_TYPE.DOCUMENT_NODE ? node : node._ownerDocument;
  if (contextDocument._parsingMode === "html") {
    return htmlSerialization(node);
  }

  const childNodes = node.childNodesForSerializing || node.childNodes;

  try {
    let serialized = "";
    for (let i = 0; i < childNodes.length; ++i) {
      serialized += produceXMLSerialization(
        utils.wrapperForImpl(childNodes[i] || childNodes.item(i)),
        { requireWellFormed }
      );
    }
    return serialized;
  } catch (e) {
    throw DOMException.create(globalObject, [e.message, "InvalidStateError"]);
  }
};
