// https://svgwg.org/svg2-draft/types.html#InterfaceSVGFitToViewBox
interface mixin SVGFitToViewBox {
  [SameObject, Reflect="viewBox"] readonly attribute SVGAnimatedRect viewBox;
  [SameObject, Reflect="preserveAspectRatio"] readonly attribute SVGAnimatedPreserveAspectRatio preserveAspectRatio;
};
