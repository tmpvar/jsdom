// https://svgwg.org/svg2-draft/types.html#InterfaceSVGURIReference
interface mixin SVGURIReference {
  [SameObject, Reflect="href", ReflectDeprecated="xlink:href"] readonly attribute SVGAnimatedString href;
};
