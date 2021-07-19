// https://dom.spec.whatwg.org/#interface-domimplementation
[Exposed=Window]
interface DOMImplementation {
  [NewObject] DocumentType createDocumentType(DOMString qualifiedName, DOMString publicId, DOMString systemId);
  [NewObject] XMLDocument createDocument(DOMString? namespace, [LegacyNullToEmptyString] DOMString qualifiedName, optional DocumentType? doctype = null);
  [NewObject] HTMLDocument createHTMLDocument(optional DOMString title);

  boolean hasFeature(); // useless; always returns true
};
