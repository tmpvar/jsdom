"use strict";
const { firstChildWithLocalName } = require("./traversal.js");
const { HTML_NS } = require("./namespaces.js");

// https://html.spec.whatwg.org/multipage/interactive-elements.html#summary-for-its-parent-details
exports.isSummaryForParentDetails = summaryElement => {
  const parent = summaryElement.parentNode;
  if (parent === null) {
    return false;
  }
  if (parent._localName !== "details" || parent._namespaceURI !== HTML_NS) {
    return false;
  }
  return firstChildWithLocalName(parent, "summary") === summaryElement;
};
