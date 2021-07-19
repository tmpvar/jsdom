// https://www.w3.org/TR/SVG11/types.html#InterfaceSVGAnimatedRect
// https://svgwg.org/svg2-draft/types.html#InterfaceSVGAnimatedRect
//
// SVG 2 uses DOMRect and DOMRectReadOnly. But that change is reverted in
// https://github.com/w3c/svgwg/issues/706
[Exposed=Window]
interface SVGAnimatedRect {
  [SameObject] readonly attribute SVGRect baseVal;
  [SameObject] readonly attribute SVGRect animVal;
};
