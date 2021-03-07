// https://dom.spec.whatwg.org/#element
[Exposed=Window]
interface Element : Node {
  readonly attribute DOMString? namespaceURI;
  readonly attribute DOMString? prefix;
  readonly attribute DOMString localName;
  readonly attribute DOMString tagName;

  [CEReactions, Reflect] attribute DOMString id;
  [CEReactions, Reflect="class"] attribute DOMString className;
  [SameObject, PutForwards=value] readonly attribute DOMTokenList classList;
  [CEReactions, Unscopable, Reflect] attribute DOMString slot;

  boolean hasAttributes();
  [SameObject] readonly attribute NamedNodeMap attributes;
  sequence<DOMString> getAttributeNames();
  DOMString? getAttribute(DOMString qualifiedName);
  DOMString? getAttributeNS(DOMString? namespace, DOMString localName);
  [CEReactions] void setAttribute(DOMString qualifiedName, DOMString value);
  [CEReactions] void setAttributeNS(DOMString? namespace, DOMString qualifiedName, DOMString value);
  [CEReactions] void removeAttribute(DOMString qualifiedName);
  [CEReactions] void removeAttributeNS(DOMString? namespace, DOMString localName);
  [CEReactions] boolean toggleAttribute(DOMString qualifiedName, optional boolean force);
  boolean hasAttribute(DOMString qualifiedName);
  boolean hasAttributeNS(DOMString? namespace, DOMString localName);

  Attr? getAttributeNode(DOMString qualifiedName);
  Attr? getAttributeNodeNS(DOMString? namespace, DOMString localName);
  [CEReactions] Attr? setAttributeNode(Attr attr);
  [CEReactions] Attr? setAttributeNodeNS(Attr attr);
  [CEReactions] Attr removeAttributeNode(Attr attr);

  ShadowRoot attachShadow(ShadowRootInit init);
  readonly attribute ShadowRoot? shadowRoot;

  Element? closest(DOMString selectors);
  boolean matches(DOMString selectors);
  boolean webkitMatchesSelector(DOMString selectors); // historical alias of .matches

  HTMLCollection getElementsByTagName(DOMString qualifiedName);
  HTMLCollection getElementsByTagNameNS(DOMString? namespace, DOMString localName);
  HTMLCollection getElementsByClassName(DOMString classNames);

  [CEReactions] Element? insertAdjacentElement(DOMString where, Element element); // historical
  void insertAdjacentText(DOMString where, DOMString data); // historical
};

dictionary ShadowRootInit {
  required ShadowRootMode mode;
};

// https://w3c.github.io/DOM-Parsing/#extensions-to-the-element-interface
partial interface Element {
  [CEReactions] attribute [LegacyNullToEmptyString] DOMString innerHTML;
  [CEReactions] attribute [LegacyNullToEmptyString] DOMString outerHTML;
  [CEReactions] void insertAdjacentHTML(DOMString position, DOMString text);
};

// https://drafts.csswg.org/cssom-view/#extension-to-the-element-interface
enum ScrollBehavior { "auto", "instant", "smooth" };

dictionary ScrollOptions {
    ScrollBehavior behavior = "auto";
};

enum ScrollLogicalPosition { "start", "center", "end", "nearest" };

dictionary ScrollIntoViewOptions : ScrollOptions {
  ScrollLogicalPosition block = "start";
  ScrollLogicalPosition inline = "nearest";
};

partial interface Element {
  DOMRectList getClientRects();
  [NewObject] DOMRect getBoundingClientRect();
  void scrollIntoView(optional (boolean or ScrollIntoViewOptions) arg);
//  void scroll(optional ScrollToOptions options);
//  void scroll(unrestricted double x, unrestricted double y);
//  void scrollTo(optional ScrollToOptions options);
//  void scrollTo(unrestricted double x, unrestricted double y);
//  void scrollBy(optional ScrollToOptions options);
//  void scrollBy(unrestricted double x, unrestricted double y);
  attribute unrestricted double scrollTop;
  attribute unrestricted double scrollLeft;
  readonly attribute long scrollWidth;
  readonly attribute long scrollHeight;
  readonly attribute long clientTop;
  readonly attribute long clientLeft;
  readonly attribute long clientWidth;
  readonly attribute long clientHeight;
};
