/* eslint-disable global-require */
"use strict";

const style = require("../level2/style.js");
const xpath = require("../level3/xpath.js");

// This object defines the mapping between the interface name and the generated interface wrapper code.
// Note: The mapping needs to stay as-is in order due to interface evaluation.
// We cannot "refactor" this to something less duplicative because that would break bundlers which depend on static
// analysis of require()s.
const generatedInterfaces = {
  DOMException: require("domexception/webidl2js-wrapper"),

  URL: require("whatwg-url/webidl2js-wrapper").URL,
  URLSearchParams: require("whatwg-url/webidl2js-wrapper").URLSearchParams,

  EventTarget: require("./generated/EventTarget.js"),

  NamedNodeMap: require("./generated/NamedNodeMap.js"),
  Node: require("./generated/Node.js"),
  Attr: require("./generated/Attr.js"),
  Element: require("./generated/Element.js"),
  DocumentFragment: require("./generated/DocumentFragment.js"),
  DOMImplementation: require("./generated/DOMImplementation.js"),
  Document: require("./generated/Document.js"),
  XMLDocument: require("./generated/XMLDocument.js"),
  CharacterData: require("./generated/CharacterData.js"),
  Text: require("./generated/Text.js"),
  CDATASection: require("./generated/CDATASection.js"),
  ProcessingInstruction: require("./generated/ProcessingInstruction.js"),
  Comment: require("./generated/Comment.js"),
  DocumentType: require("./generated/DocumentType.js"),
  NodeList: require("./generated/NodeList.js"),
  HTMLCollection: require("./generated/HTMLCollection.js"),
  HTMLOptionsCollection: require("./generated/HTMLOptionsCollection.js"),
  DOMStringMap: require("./generated/DOMStringMap.js"),
  DOMTokenList: require("./generated/DOMTokenList.js"),

  StyleSheetList: require("./generated/StyleSheetList.js"),

  HTMLElement: require("./generated/HTMLElement.js"),
  HTMLHeadElement: require("./generated/HTMLHeadElement.js"),
  HTMLTitleElement: require("./generated/HTMLTitleElement.js"),
  HTMLBaseElement: require("./generated/HTMLBaseElement.js"),
  HTMLLinkElement: require("./generated/HTMLLinkElement.js"),
  HTMLMetaElement: require("./generated/HTMLMetaElement.js"),
  HTMLStyleElement: require("./generated/HTMLStyleElement.js"),
  HTMLBodyElement: require("./generated/HTMLBodyElement.js"),
  HTMLHeadingElement: require("./generated/HTMLHeadingElement.js"),
  HTMLParagraphElement: require("./generated/HTMLParagraphElement.js"),
  HTMLHRElement: require("./generated/HTMLHRElement.js"),
  HTMLPreElement: require("./generated/HTMLPreElement.js"),
  HTMLUListElement: require("./generated/HTMLUListElement.js"),
  HTMLOListElement: require("./generated/HTMLOListElement.js"),
  HTMLLIElement: require("./generated/HTMLLIElement.js"),
  HTMLMenuElement: require("./generated/HTMLMenuElement.js"),
  HTMLDListElement: require("./generated/HTMLDListElement.js"),
  HTMLDivElement: require("./generated/HTMLDivElement.js"),
  HTMLAnchorElement: require("./generated/HTMLAnchorElement.js"),
  HTMLAreaElement: require("./generated/HTMLAreaElement.js"),
  HTMLBRElement: require("./generated/HTMLBRElement.js"),
  HTMLButtonElement: require("./generated/HTMLButtonElement.js"),
  HTMLCanvasElement: require("./generated/HTMLCanvasElement.js"),
  HTMLDataElement: require("./generated/HTMLDataElement.js"),
  HTMLDataListElement: require("./generated/HTMLDataListElement.js"),
  HTMLDetailsElement: require("./generated/HTMLDetailsElement.js"),
  HTMLDialogElement: require("./generated/HTMLDialogElement.js"),
  HTMLDirectoryElement: require("./generated/HTMLDirectoryElement.js"),
  HTMLFieldSetElement: require("./generated/HTMLFieldSetElement.js"),
  HTMLFontElement: require("./generated/HTMLFontElement.js"),
  HTMLFormElement: require("./generated/HTMLFormElement.js"),
  HTMLHtmlElement: require("./generated/HTMLHtmlElement.js"),
  HTMLImageElement: require("./generated/HTMLImageElement.js"),
  HTMLInputElement: require("./generated/HTMLInputElement.js"),
  HTMLLabelElement: require("./generated/HTMLLabelElement.js"),
  HTMLLegendElement: require("./generated/HTMLLegendElement.js"),
  HTMLMapElement: require("./generated/HTMLMapElement.js"),
  HTMLMarqueeElement: require("./generated/HTMLMarqueeElement.js"),
  HTMLMediaElement: require("./generated/HTMLMediaElement.js"),
  HTMLMeterElement: require("./generated/HTMLMeterElement.js"),
  HTMLModElement: require("./generated/HTMLModElement.js"),
  HTMLOptGroupElement: require("./generated/HTMLOptGroupElement.js"),
  HTMLOptionElement: require("./generated/HTMLOptionElement.js"),
  HTMLOutputElement: require("./generated/HTMLOutputElement.js"),
  HTMLPictureElement: require("./generated/HTMLPictureElement.js"),
  HTMLProgressElement: require("./generated/HTMLProgressElement.js"),
  HTMLQuoteElement: require("./generated/HTMLQuoteElement.js"),
  HTMLScriptElement: require("./generated/HTMLScriptElement.js"),
  HTMLSelectElement: require("./generated/HTMLSelectElement.js"),
  HTMLSlotElement: require("./generated/HTMLSlotElement.js"),
  HTMLSourceElement: require("./generated/HTMLSourceElement.js"),
  HTMLSpanElement: require("./generated/HTMLSpanElement.js"),
  HTMLTableCaptionElement: require("./generated/HTMLTableCaptionElement.js"),
  HTMLTableCellElement: require("./generated/HTMLTableCellElement.js"),
  HTMLTableColElement: require("./generated/HTMLTableColElement.js"),
  HTMLTableElement: require("./generated/HTMLTableElement.js"),
  HTMLTimeElement: require("./generated/HTMLTimeElement.js"),
  HTMLTableRowElement: require("./generated/HTMLTableRowElement.js"),
  HTMLTableSectionElement: require("./generated/HTMLTableSectionElement.js"),
  HTMLTemplateElement: require("./generated/HTMLTemplateElement.js"),
  HTMLTextAreaElement: require("./generated/HTMLTextAreaElement.js"),
  HTMLUnknownElement: require("./generated/HTMLUnknownElement.js"),
  HTMLFrameElement: require("./generated/HTMLFrameElement.js"),
  HTMLFrameSetElement: require("./generated/HTMLFrameSetElement.js"),
  HTMLIFrameElement: require("./generated/HTMLIFrameElement.js"),
  HTMLEmbedElement: require("./generated/HTMLEmbedElement.js"),
  HTMLObjectElement: require("./generated/HTMLObjectElement.js"),
  HTMLParamElement: require("./generated/HTMLParamElement.js"),
  HTMLVideoElement: require("./generated/HTMLVideoElement.js"),
  HTMLAudioElement: require("./generated/HTMLAudioElement.js"),
  HTMLTrackElement: require("./generated/HTMLTrackElement.js"),

  SVGElement: require("./generated/SVGElement.js"),
  SVGGraphicsElement: require("./generated/SVGGraphicsElement.js"),
  SVGSVGElement: require("./generated/SVGSVGElement.js"),
  SVGTitleElement: require("./generated/SVGTitleElement.js"),
  SVGAnimatedString: require("./generated/SVGAnimatedString.js"),
  SVGNumber: require("./generated/SVGNumber.js"),
  SVGStringList: require("./generated/SVGStringList.js"),

  Event: require("./generated/Event.js"),
  CloseEvent: require("./generated/CloseEvent.js"),
  CustomEvent: require("./generated/CustomEvent.js"),
  MessageEvent: require("./generated/MessageEvent.js"),
  ErrorEvent: require("./generated/ErrorEvent.js"),
  HashChangeEvent: require("./generated/HashChangeEvent.js"),
  PopStateEvent: require("./generated/PopStateEvent.js"),
  StorageEvent: require("./generated/StorageEvent.js"),
  ProgressEvent: require("./generated/ProgressEvent.js"),
  PageTransitionEvent: require("./generated/PageTransitionEvent.js"),

  UIEvent: require("./generated/UIEvent.js"),
  FocusEvent: require("./generated/FocusEvent.js"),
  InputEvent: require("./generated/InputEvent.js"),
  MouseEvent: require("./generated/MouseEvent.js"),
  KeyboardEvent: require("./generated/KeyboardEvent.js"),
  TouchEvent: require("./generated/TouchEvent.js"),
  CompositionEvent: require("./generated/CompositionEvent.js"),
  WheelEvent: require("./generated/WheelEvent.js"),

  BarProp: require("./generated/BarProp.js"),
  External: require("./generated/External.js"),
  Location: require("./generated/Location.js"),
  History: require("./generated/History.js"),
  Screen: require("./generated/Screen.js"),
  Performance: require("./generated/Performance.js"),
  Navigator: require("./generated/Navigator.js"),

  PluginArray: require("./generated/PluginArray.js"),
  MimeTypeArray: require("./generated/MimeTypeArray.js"),
  Plugin: require("./generated/Plugin.js"),
  MimeType: require("./generated/MimeType.js"),

  FileReader: require("./generated/FileReader.js"),
  Blob: require("./generated/Blob.js"),
  File: require("./generated/File.js"),
  FileList: require("./generated/FileList.js"),
  ValidityState: require("./generated/ValidityState.js"),

  DOMParser: require("./generated/DOMParser.js"),
  XMLSerializer: require("./generated/XMLSerializer.js"),

  FormData: require("./generated/FormData.js"),
  XMLHttpRequestEventTarget: require("./generated/XMLHttpRequestEventTarget.js"),
  XMLHttpRequestUpload: require("./generated/XMLHttpRequestUpload.js"),
  XMLHttpRequest: require("./generated/XMLHttpRequest.js"),
  WebSocket: require("./generated/WebSocket.js"),

  NodeFilter: require("./generated/NodeFilter.js"),
  NodeIterator: require("./generated/NodeIterator.js"),
  TreeWalker: require("./generated/TreeWalker.js"),

  AbstractRange: require("./generated/AbstractRange.js"),
  Range: require("./generated/Range.js"),
  StaticRange: require("./generated/StaticRange.js"),
  Selection: require("./generated/Selection.js"),

  Storage: require("./generated/Storage.js"),

  CustomElementRegistry: require("./generated/CustomElementRegistry.js"),
  ShadowRoot: require("./generated/ShadowRoot.js"),

  MutationObserver: require("./generated/MutationObserver.js"),
  MutationRecord: require("./generated/MutationRecord.js"),

  Headers: require("./generated/Headers.js"),
  AbortController: require("./generated/AbortController.js"),
  AbortSignal: require("./generated/AbortSignal.js")
};

function install(window, name, interfaceConstructor) {
  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value: interfaceConstructor
  });
}

exports.installInterfaces = (window, globalNames) => {
  // Install generated interface.
  for (const generatedInterface of Object.values(generatedInterfaces)) {
    generatedInterface.install(window, globalNames);
  }

  // Install legacy HTMLDocument interface
  // https://html.spec.whatwg.org/#htmldocument
  install(window, "HTMLDocument", window.Document);

  // These need to be cleaned up...
  style.addToCore(window);
  xpath(window);
};

// Returns an interface webidl2js wrapper given its an interface name.
exports.getInterfaceWrapper = name => {
  return generatedInterfaces[name];
};
