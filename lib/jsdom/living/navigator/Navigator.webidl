// https://html.spec.whatwg.org/#navigator
[Exposed=Window]
interface Navigator {
  // objects implementing this interface also implement the interfaces given below
};
Navigator includes NavigatorID;
Navigator includes NavigatorLanguage;
Navigator includes NavigatorOnLine;
// Navigator includes NavigatorContentUtils;
Navigator includes NavigatorCookies;
Navigator includes NavigatorPlugins;
Navigator includes NavigatorConcurrentHardware;

// https://html.spec.whatwg.org/#navigatorid
interface mixin NavigatorID {
  readonly attribute DOMString appCodeName; // constant "Mozilla"
  readonly attribute DOMString appName; // constant "Netscape"
  readonly attribute DOMString appVersion;
  readonly attribute DOMString platform;
  readonly attribute DOMString product; // constant "Gecko"
  [Exposed=Window] readonly attribute DOMString productSub;
  readonly attribute DOMString userAgent;
  [Exposed=Window] readonly attribute DOMString vendor;
  [Exposed=Window] readonly attribute DOMString vendorSub; // constant ""
};

// https://html.spec.whatwg.org/#navigatorlanguage
interface mixin NavigatorLanguage {
  readonly attribute DOMString language;
  readonly attribute FrozenArray<DOMString> languages;
};

// https://html.spec.whatwg.org/#navigatoronline
interface mixin NavigatorOnLine {
  readonly attribute boolean onLine;
};

// https://html.spec.whatwg.org/#navigatorcookies
interface mixin NavigatorCookies {
  readonly attribute boolean cookieEnabled;
};

// https://html.spec.whatwg.org/#navigatorplugins
interface mixin NavigatorPlugins {
  [SameObject] readonly attribute PluginArray plugins;
  [SameObject] readonly attribute MimeTypeArray mimeTypes;
  boolean javaEnabled();
};

// https://html.spec.whatwg.org/#pluginarray
[Exposed=Window,
 LegacyUnenumerableNamedProperties]
interface PluginArray {
  void refresh(optional boolean reload = false);
  readonly attribute unsigned long length;
  [WebIDL2JSValueAsUnsupported=_null] getter Plugin? item(unsigned long index);
  [WebIDL2JSValueAsUnsupported=_null] getter Plugin? namedItem(DOMString name);
};

// https://html.spec.whatwg.org/#mimetypearray
[Exposed=Window,
 LegacyUnenumerableNamedProperties]
interface MimeTypeArray {
  readonly attribute unsigned long length;
  [WebIDL2JSValueAsUnsupported=_null] getter MimeType? item(unsigned long index);
  [WebIDL2JSValueAsUnsupported=_null] getter MimeType? namedItem(DOMString name);
};

// https://html.spec.whatwg.org/#dom-plugin
[Exposed=Window,
 LegacyUnenumerableNamedProperties]
interface Plugin {
  readonly attribute DOMString name;
  readonly attribute DOMString description;
  readonly attribute DOMString filename;
  readonly attribute unsigned long length;
  [WebIDL2JSValueAsUnsupported=_null] getter MimeType? item(unsigned long index);
  [WebIDL2JSValueAsUnsupported=_null] getter MimeType? namedItem(DOMString name);
};

// https://html.spec.whatwg.org/#mimetype
[Exposed=Window]
interface MimeType {
  readonly attribute DOMString type;
  readonly attribute DOMString description;
  readonly attribute DOMString suffixes; // comma-separated
  readonly attribute Plugin enabledPlugin;
};

// https://html.spec.whatwg.org/#navigatorconcurrenthardware
interface mixin NavigatorConcurrentHardware {
  readonly attribute unsigned long long hardwareConcurrency;
};

// https://w3c.github.io/pointerevents/#extensions-to-the-navigator-interface
partial interface Navigator {
    readonly  attribute long maxTouchPoints;
};
