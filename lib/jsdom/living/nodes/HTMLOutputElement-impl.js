"use strict";

const DOMTokenList = require("../generated/DOMTokenList.js");
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const DefaultConstraintValidationImpl =
  require("../constraint-validation/DefaultConstraintValidation-impl.js").implementation;
const { mixin } = require("../../utils.js");
const { getLabelsForLabelable, formOwner } = require("../helpers/form-controls.js");

class HTMLOutputElementImpl extends HTMLElementImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);
    this._labels = null;
    this._defaultValue = "";
    this._valueMode = "default";

    this._customValidityErrorMessage = "";
  }

  _attrModified(name, value, oldValue) {
    super._attrModified(name, value, oldValue);

    if (name === "for" && this._htmlFor !== undefined) {
      this._htmlFor.attrModified();
    }
  }

  _barredFromConstraintValidationSpecialization() {
    return true;
  }

  _formReset() {
    if (this._valueMode === "value") {
      this.textContent = this._defaultValue;
    }

    this._defaultValue = "";
    this._valueMode = "default";
  }

  get htmlFor() {
    if (this._htmlFor === undefined) {
      this._htmlFor = DOMTokenList.createImpl(this._globalObject, [], {
        element: this,
        attributeLocalName: "for"
      });
    }
    return this._htmlFor;
  }

  get type() {
    return "output";
  }

  get labels() {
    return getLabelsForLabelable(this);
  }

  get form() {
    return formOwner(this);
  }

  get value() {
    return this.textContent;
  }

  set value(val) {
    this._valueMode = "value";
    this._defaultValue = this.textContent;
    this.textContent = val;
  }

  get defaultValue() {
    return this._valueMode === "default" ? this.textContent : this._defaultValue;
  }

  set defaultValue(val) {
    this._defaultValue = val;

    if (this._valueMode === "default") {
      this.textContent = val;
    }
  }
}

mixin(HTMLOutputElementImpl.prototype, DefaultConstraintValidationImpl.prototype);

module.exports = {
  implementation: HTMLOutputElementImpl
};
