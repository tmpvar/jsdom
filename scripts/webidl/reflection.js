"use strict";

const { XLINK_NS } = require("../../lib/jsdom/living/helpers/namespaces");

function isSimpleIDLType(idlType, expected) {
  if (idlType.generic !== "" || idlType.union) {
    return false;
  }
  return idlType.idlType === expected;
}

function getExtAttrValue(idl, extAttrName) {
  const reflectDeprecatedAttr = idl.extAttrs.find(extAttr => extAttr.name === extAttrName);
  if (reflectDeprecatedAttr) {
    return JSON.parse(reflectDeprecatedAttr.rhs.value);
  }
  return undefined;
}

function checkAttributeNamespace(attr) {
  if (attr.includes(":")) {
    throw new Error(`Namespace not supported for attribute ${attr}`);
  }
}

function extractAttributeInfo(attr) {
  if (attr === undefined) {
    return undefined;
  }

  const parts = attr.split(":");
  if (parts.length === 1) {
    return { ns: null, name: parts[0] };
  }
  if (parts.length === 2) {
    let ns;
    if (parts[0] === "xlink") {
      ns = XLINK_NS;
    } else {
      throw new Error(`Unrecognized attribute namespace name ${parts[0]}`);
    }
    return { ns, name: parts[1] };
  }
  throw new Error(`Invalid attribute "${attr}"`);
}

// https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes
// https://svgwg.org/svg2-draft/types.html#TermReflect
function processReflect(utils, idl, implObj) {
  const reflectAttr = idl.extAttrs.find(attr => attr.name === "Reflect");
  const attrName = (reflectAttr && reflectAttr.rhs && JSON.parse(reflectAttr.rhs.value)) || idl.name.toLowerCase();

  if (idl.extAttrs.find(attr => attr.name === "ReflectURL")) {
    checkAttributeNamespace(attrName);

    // Allow DOMString also due to https://github.com/whatwg/html/issues/5241.
    if (!isSimpleIDLType(idl.idlType, "USVString") && !isSimpleIDLType(idl.idlType, "DOMString")) {
      throw new Error("[ReflectURL] specified on non-USV/DOMString attribute");
    }
    const parseURLToResultingURLRecord =
      utils.addImport("../helpers/document-base-url", "parseURLToResultingURLRecord");
    const serializeURL = utils.addImport("whatwg-url", "serializeURL");
    return {
      get: `
        const value = ${implObj}.getAttributeNS(null, "${attrName}");
        if (value === null) {
          return "";
        }
        const urlRecord = ${parseURLToResultingURLRecord}(value, ${implObj}._ownerDocument);
        if (urlRecord !== null) {
          return ${serializeURL}(urlRecord);
        }
        return conversions.USVString(value);
      `,
      set: `
        ${implObj}.setAttributeNS(null, "${attrName}", V);
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "DOMString") || isSimpleIDLType(idl.idlType, "USVString")) {
    checkAttributeNamespace(attrName);

    const isUSV = isSimpleIDLType(idl.idlType, "USVString");
    return {
      get: `
        const value = ${implObj}.getAttributeNS(null, "${attrName}");
        return value === null ? "" : ${isUSV ? "conversions.USVString(value)" : "value"};
      `,
      set: `
        ${implObj}.setAttributeNS(null, "${attrName}", V);
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "boolean")) {
    checkAttributeNamespace(attrName);

    return {
      get: `
        return ${implObj}.hasAttributeNS(null, "${attrName}");
      `,
      set: `
        if (V) {
          ${implObj}.setAttributeNS(null, "${attrName}", "");
        } else {
          ${implObj}.removeAttributeNS(null, "${attrName}");
        }
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "long")) {
    const parseInteger = utils.addImport("../helpers/strings", "parseInteger");
    checkAttributeNamespace(attrName);

    return {
      get: `
        let value = ${implObj}.getAttributeNS(null, "${attrName}");
        if (value === null) {
          return 0;
        }
        value = ${parseInteger}(value);
        return value !== null && conversions.long(value) === value ? value : 0;
      `,
      set: `
        ${implObj}.setAttributeNS(null, "${attrName}", String(V));
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "unsigned long")) {
    const parseNonNegativeInteger = utils.addImport("../helpers/strings", "parseNonNegativeInteger");
    checkAttributeNamespace(attrName);

    return {
      get: `
        let value = ${implObj}.getAttributeNS(null, "${attrName}");
        if (value === null) {
          return 0;
        }
        value = ${parseNonNegativeInteger}(value);
        return value !== null && value >= 0 && value <= 2147483647 ? value : 0;
      `,
      set: `
        const n = V <= 2147483647 ? V : 0;
        ${implObj}.setAttributeNS(null, "${attrName}", String(n));
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "SVGAnimatedString")) {
    const SVGAnimatedString = utils.addImport("./SVGAnimatedString");
    checkAttributeNamespace(attrName);
    const deprecatedAttr = extractAttributeInfo(getExtAttrValue(idl, "ReflectDeprecated"));
    const initialValue = getExtAttrValue(idl, "ReflectInitial");
    if (initialValue !== undefined && typeof initialValue !== "string") {
      throw new Error("Initial value of SVGAnimatedString must be a string");
    }

    return {
      get: `
        return ${SVGAnimatedString}.create(globalObject, [], {
          element: ${implObj},
          attribute: "${attrName}",
          ${deprecatedAttr !== undefined ?
            `attributeDeprecatedNamespace: ${JSON.stringify(deprecatedAttr.ns)},
             attributeDeprecated: ${JSON.stringify(deprecatedAttr.name)},` :
            ""}
          ${initialValue !== undefined ?
            `initialValue: ${JSON.stringify(initialValue)},` :
            ""}
        });
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "SVGAnimatedPreserveAspectRatio")) {
    const SVGAnimatedPreserveAspectRatio = utils.addImport("./SVGAnimatedPreserveAspectRatio");
    if (attrName !== "preserveAspectRatio") {
      throw new Error("SVGAnimatedPreserveAspectRatio can only be used with the preserveAspectRatio attribute");
    }

    return {
      get: `
        return ${SVGAnimatedPreserveAspectRatio}.create(globalObject, [], {
          element: ${implObj}
        });
      `
    };
  }

  if (isSimpleIDLType(idl.idlType, "SVGAnimatedRect")) {
    const SVGAnimatedRect = utils.addImport("./SVGAnimatedRect");
    checkAttributeNamespace(attrName);

    return {
      get: `
        return ${SVGAnimatedRect}.create(globalObject, [], {
          element: ${implObj},
          attribute: "${attrName}"
        });
      `
    };
  }

  throw new Error("Unrecognized reflection type " + idl.idlType.idlType);
}

module.exports = processReflect;
