// https://drafts.fxtf.org/geometry/#domrect

// Commented out for https://github.com/w3c/svgwg/issues/706
// [LegacyWindowAlias=SVGRect]
[Exposed=(Window,Worker),
 Serializable]
interface DOMRect : DOMRectReadOnly {
    constructor(optional unrestricted double x = 0, optional unrestricted double y = 0,
            optional unrestricted double width = 0, optional unrestricted double height = 0);

    [NewObject, WebIDL2JSCallWithGlobal] static DOMRect fromRect(optional DOMRectInit other = {});

    inherit attribute unrestricted double x;
    inherit attribute unrestricted double y;
    inherit attribute unrestricted double width;
    inherit attribute unrestricted double height;
};
