// https://dom.spec.whatwg.org/#document
[Exposed=Window]
interface Document : Node {
  constructor();

  [SameObject] readonly attribute DOMImplementation implementation;
  readonly attribute USVString URL;
  readonly attribute USVString documentURI;
  readonly attribute DOMString compatMode;
  readonly attribute DOMString characterSet;
  readonly attribute DOMString charset; // historical alias of .characterSet
  readonly attribute DOMString inputEncoding; // historical alias of .characterSet
  readonly attribute DOMString contentType;

  readonly attribute DocumentType? doctype;
  readonly attribute Element? documentElement;
  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [CEReactions, NewObject] Element createElement(DOMString localName, optional (DOMString or ElementCreationOptions) options);
  [CEReactions, NewObject] Element createElementNS(DOMString? namespace, DOMString qualifiedName, optional (DOMString or ElementCreationOptions) options);
  [NewObject] DocumentFragment createDocumentFragment();
  [NewObject] Text createTextNode(DOMString data);
  [NewObject] CDATASection createCDATASection(DOMString data);
  [NewObject] Comment createComment(DOMString data);
  [NewObject] ProcessingInstruction createProcessingInstruction(DOMString target, DOMString data);

  [CEReactions, NewObject] Node importNode(Node node, optional boolean deep = false);
  [CEReactions] Node adoptNode(Node node);

  [NewObject] Attr createAttribute(DOMString localName);
  [NewObject] Attr createAttributeNS(DOMString? namespace, DOMString qualifiedName);

  [NewObject] Event createEvent(DOMString interface);

  [NewObject] Range createRange();

  // NodeFilter.SHOW_ALL = 0xFFFFFFFF
  [NewObject] NodeIterator createNodeIterator(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
  [NewObject] TreeWalker createTreeWalker(Node root, optional unsigned long whatToShow = 0xFFFFFFFF, optional NodeFilter? filter = null);
};

dictionary ElementCreationOptions {
  DOMString is;
};

// https://html.spec.whatwg.org/#document
enum DocumentReadyState { "loading", "interactive", "complete" };
// We don't support SVGScriptElement yet
// typedef (HTMLScriptElement or SVGScriptElement) HTMLOrSVGScriptElement;

partial interface Document {
  // resource metadata management
  [PutForwards=href, LegacyUnforgeable] readonly attribute Location? location;
//  attribute USVString domain;
  readonly attribute USVString referrer;
  attribute USVString cookie;
  readonly attribute DOMString lastModified;
  readonly attribute DocumentReadyState readyState;

  // DOM tree accessors
  [CEReactions] attribute DOMString title;
  [CEReactions] attribute DOMString dir;
  [CEReactions] attribute HTMLElement? body;
  readonly attribute HTMLHeadElement? head;
  [SameObject] readonly attribute HTMLCollection images;
  [SameObject] readonly attribute HTMLCollection embeds;
  [SameObject] readonly attribute HTMLCollection plugins;
  [SameObject] readonly attribute HTMLCollection links;
  [SameObject] readonly attribute HTMLCollection forms;
  [SameObject] readonly attribute HTMLCollection scripts;
  NodeList getElementsByName(DOMString elementName);
//  We don't support SVGScriptElement yet
//  readonly attribute HTMLOrSVGScriptElement? currentScript; // classic scripts in a document tree only
  readonly attribute HTMLScriptElement? currentScript; // classic scripts in a document tree only

  // dynamic markup insertion
  [CEReactions] Document open(optional DOMString type = "text/html", optional DOMString replace = "");
//  WindowProxy open(USVString url, DOMString name, DOMString features);
  [CEReactions] void close();
  [CEReactions] void write(DOMString... text);
  [CEReactions] void writeln(DOMString... text);

  // user interaction
  readonly attribute WindowProxy? defaultView;
  boolean hasFocus();
//  [CEReactions] attribute DOMString designMode;
//  [CEReactions] boolean execCommand(DOMString commandId, optional boolean showUI = false, optional DOMString value = "");
//  boolean queryCommandEnabled(DOMString commandId);
//  boolean queryCommandIndeterm(DOMString commandId);
//  boolean queryCommandState(DOMString commandId);
//  boolean queryCommandSupported(DOMString commandId);
//  DOMString queryCommandValue(DOMString commandId);

  // special event handler IDL attributes that only apply to Document objects
  [LegacyLenientThis] attribute EventHandler onreadystatechange;
};
Document includes GlobalEventHandlers;
// Document includes DocumentAndElementEventHandlers;

// https://html.spec.whatwg.org/#Document-partial
partial interface Document {
//  [CEReactions] attribute [LegacyNullToEmptyString] DOMString fgColor;
//  [CEReactions] attribute [LegacyNullToEmptyString] DOMString linkColor;
//  [CEReactions] attribute [LegacyNullToEmptyString] DOMString vlinkColor;
//  [CEReactions] attribute [LegacyNullToEmptyString] DOMString alinkColor;
//  [CEReactions] attribute [LegacyNullToEmptyString] DOMString bgColor;

  [SameObject] readonly attribute HTMLCollection anchors;
  [SameObject] readonly attribute HTMLCollection applets;

  void clear();
  void captureEvents();
  void releaseEvents();

//  [SameObject] readonly attribute HTMLAllCollection all;
};

// https://drafts.csswg.org/cssom/#extensions-to-the-document-interface
partial interface Document {
  [SameObject] readonly attribute StyleSheetList styleSheets;
};

// https://w3c.github.io/page-visibility/#extensions-to-the-document-interface
enum VisibilityState { "hidden", "visible", "prerender" };

partial interface Document {
  readonly attribute boolean hidden;
  readonly attribute VisibilityState visibilityState;
  attribute EventHandler onvisibilitychange;
};

// https://w3c.github.io/selection-api/#extensions-to-document-interface
partial interface Document {
  Selection? getSelection();
};
