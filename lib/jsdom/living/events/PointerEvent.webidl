// https://w3c.github.io/pointerevents/#pointerevent-interface

dictionary PointerEventInit : MouseEventInit {
    long        pointerId = 0;
    double      width = 1;
    double      height = 1;
    float       pressure = 0;
    float       tangentialPressure = 0;
    long        tiltX = 0;
    long        tiltY = 0;
    long        twist = 0;
    DOMString   pointerType = "";
    boolean     isPrimary = false;
};

[Constructor(DOMString type, optional PointerEventInit eventInitDict), Exposed=Window]
interface PointerEvent : MouseEvent {
    readonly        attribute long        pointerId;
    readonly        attribute double      width;
    readonly        attribute double      height;
    readonly        attribute float       pressure;
    readonly        attribute float       tangentialPressure;
    readonly        attribute long        tiltX;
    readonly        attribute long        tiltY;
    readonly        attribute long        twist;
    readonly        attribute DOMString   pointerType;
    readonly        attribute boolean     isPrimary;
};
