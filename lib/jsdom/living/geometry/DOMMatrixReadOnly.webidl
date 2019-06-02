// https://www.w3.org/TR/geometry-1/#dommatrixreadonly

[Constructor(optional (DOMString or sequence<unrestricted double>) init),
 Exposed=(Window,Worker),
 Serializable]
interface DOMMatrixReadOnly {
    [NewObject] static DOMMatrixReadOnlyImpl fromMatrix(optional DOMMatrixInit other);
    [NewObject] static DOMMatrixReadOnlyImpl fromFloat32Array(Float32Array array32);
    [NewObject] static DOMMatrixReadOnlyImpl fromFloat64Array(Float64Array array64);

    // These attributes are simple aliases for certain elements of the 4x4 matrix
    readonly attribute unrestricted double a;
    readonly attribute unrestricted double b;
    readonly attribute unrestricted double c;
    readonly attribute unrestricted double d;
    readonly attribute unrestricted double e;
    readonly attribute unrestricted double f;

    readonly attribute unrestricted double m11;
    readonly attribute unrestricted double m12;
    readonly attribute unrestricted double m13;
    readonly attribute unrestricted double m14;
    readonly attribute unrestricted double m21;
    readonly attribute unrestricted double m22;
    readonly attribute unrestricted double m23;
    readonly attribute unrestricted double m24;
    readonly attribute unrestricted double m31;
    readonly attribute unrestricted double m32;
    readonly attribute unrestricted double m33;
    readonly attribute unrestricted double m34;
    readonly attribute unrestricted double m41;
    readonly attribute unrestricted double m42;
    readonly attribute unrestricted double m43;
    readonly attribute unrestricted double m44;

    readonly attribute boolean is2D;
    readonly attribute boolean isIdentity;

    // Immutable transform methods
    [NewObject] DOMMatrix translate(optional unrestricted double tx = 0,
                                    optional unrestricted double ty = 0,
                                    optional unrestricted double tz = 0);
    [NewObject] DOMMatrix scale(optional unrestricted double scaleX = 1,
                                optional unrestricted double scaleY,
                                optional unrestricted double scaleZ = 1,
                                optional unrestricted double originX = 0,
                                optional unrestricted double originY = 0,
                                optional unrestricted double originZ = 0);
    [NewObject] DOMMatrix scaleNonUniform(optional unrestricted double scaleX = 1,
                                          optional unrestricted double scaleY = 1);
    [NewObject] DOMMatrix scale3d(optional unrestricted double scale = 1,
                                  optional unrestricted double originX = 0,
                                  optional unrestricted double originY = 0,
                                  optional unrestricted double originZ = 0);
    [NewObject] DOMMatrix rotate(optional unrestricted double rotX = 0,
                                 optional unrestricted double rotY,
                                 optional unrestricted double rotZ);
    [NewObject] DOMMatrix rotateFromVector(optional unrestricted double x = 0,
                                           optional unrestricted double y = 0);
    [NewObject] DOMMatrix rotateAxisAngle(optional unrestricted double x = 0,
                                          optional unrestricted double y = 0,
                                          optional unrestricted double z = 0,
                                          optional unrestricted double angle = 0);
    [NewObject] DOMMatrix skewX(optional unrestricted double sx = 0);
    [NewObject] DOMMatrix skewY(optional unrestricted double sy = 0);
    [NewObject] DOMMatrix multiply(optional DOMMatrixInit other);
    [NewObject] DOMMatrix flipX();
    [NewObject] DOMMatrix flipY();
    [NewObject] DOMMatrix inverse();

    [NewObject] DOMPoint transformPoint(optional DOMPointInit point);
    [NewObject] Float32Array toFloat32Array();
    [NewObject] Float64Array toFloat64Array();

    [Exposed=Window] stringifier;
    [Default] object toJSON();
};
