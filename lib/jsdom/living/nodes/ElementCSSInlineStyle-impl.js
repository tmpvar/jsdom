"use strict";
const cssstyle = require("cssstyle");

class ElementCSSInlineStyle {
  _initElementCSSInlineStyle() {
    this._settingCssText = false;
    this._style = new cssstyle.CSSStyleDeclaration(newCssText => {
      if (!this._settingCssText) {
        this._settingCssText = true;
        this.setAttributeNS(null, "style", newCssText);
        this._settingCssText = false;
      }
    });
  }
  get style() {
    return this._style;
  }
  set style(value) {
    // this is never called. in ElementCSSInlineStyle.webidl
    // `e.style = x` is redirected to `e.style.cssText = x`
    this._style.cssText = value;
  }
}

module.exports = {
  implementation: ElementCSSInlineStyle
};
