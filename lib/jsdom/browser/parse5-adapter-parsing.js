"use strict";
const DocumentType = require("../living/generated/DocumentType");
const DocumentFragment = require("../living/generated/DocumentFragment");
const Text = require("../living/generated/Text");
const Comment = require("../living/generated/Comment");
const attributes = require("../living/attributes");
const nodeTypes = require("../living/node-type");
const serializationAdapter = require("./parse5-adapter-serialization");

module.exports = class JSDOMParse5Adapter {
  constructor(documentImpl, core) {
    this._documentImpl = documentImpl;
    this._core = core;
  }

  createDocument() {
    // parse5's model assumes that parse(html) will call into here to create the new Document, then return it. However,
    // jsdom's model assumes we can create a Window (and through that create an empty Document), do some other setup
    // stuff, and then parse, stuffing nodes into that Document as we go. So to adapt between these two models, we just
    // return the already-created Document when asked by parse5 to "create" a Document.
    return this._documentImpl;
  }

  createDocumentFragment() {
    return DocumentFragment.createImpl([], {
      core: this._core,
      ownerDocument: this._documentImpl
    });
  }

  createElement(localName, namespace, attrs) {
    const element = this._documentImpl._createElementWithCorrectElementInterface(localName, namespace);
    element._namespaceURI = namespace;
    this.adoptAttributes(element, attrs);

    return element;
  }

  createCommentNode(data) {
    return Comment.createImpl([], {
      data,
      core: this._core,
      ownerDocument: this._documentImpl
    });
  }

  appendChild(parentNode, newNode) {
    parentNode.appendChild(newNode);
  }

  insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  setTemplateContent(templateElement, contentFragment) {
    templateElement._templateContents = contentFragment;
  }

  setDocumentType(document, name, publicId, systemId) {
    const documentType = DocumentType.createImpl([], {
      name,
      publicId,
      systemId,
      core: this._core,
      ownerDocument: this._documentImpl
    });
    document.appendChild(documentType);
  }

  setDocumentMode(document, mode) {
    // TODO: the rest of jsdom ignores this
    document._mode = mode;
  }

  detachNode(node) {
    node.remove();
  }

  insertText(parentNode, text) {
    const { lastChild } = parentNode;
    if (lastChild && lastChild.nodeType === nodeTypes.TEXT_NODE) {
      lastChild.data += text;
    } else {
      const textNode = Text.createImpl([], {
        data: text,
        core: this._core,
        ownerDocument: this._documentImpl
      });

      parentNode.appendChild(textNode);
    }

  }

  insertTextBefore(parentNode, text, referenceNode) {
    const { previousSibling } = referenceNode;
    if (previousSibling && previousSibling.nodeType === nodeTypes.TEXT_NODE) {
      previousSibling.data += text;
    } else {
      const textNode = Text.createImpl([], {
        data: text,
        core: this._core,
        ownerDocument: this._documentImpl
      });

      parentNode.insertBefore(textNode, referenceNode);
    }
  }

  adoptAttributes(element, attrs) {
    for (const attr of attrs) {
      attributes.setAttributeValue(element, attr.name, attr.value, attr.prefix, attr.namespace);
    }
  }
};

Object.assign(module.exports.prototype, serializationAdapter);