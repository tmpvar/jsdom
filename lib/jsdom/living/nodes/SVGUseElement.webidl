// https://svgwg.org/svg2-draft/struct.html#InterfaceSVGUseElement
[Exposed=Window]
interface SVGUseElement : SVGGraphicsElement {
  // [SameObject] readonly attribute SVGAnimatedLength x;
  // [SameObject] readonly attribute SVGAnimatedLength y;
  // [SameObject] readonly attribute SVGAnimatedLength width;
  // [SameObject] readonly attribute SVGAnimatedLength height;
  // [SameObject] readonly attribute SVGElement? instanceRoot;
  // [SameObject] readonly attribute SVGElement? animatedInstanceRoot;
};

SVGUseElement includes SVGURIReference;
