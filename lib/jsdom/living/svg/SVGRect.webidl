// http://www.w3.org/TR/SVG11/types.html#InterfaceSVGRect
// Not in SVG 2, but should be restored per https://github.com/w3c/svgwg/issues/706
[Exposed=Window]
interface SVGRect {
    attribute float x;
    attribute float y;
    attribute float width;
    attribute float height;
};
