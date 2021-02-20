"use strict";
const HTMLCollection = require("../generated/HTMLCollection.js");
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const DefaultConstraintValidationImpl =
  require("../constraint-validation/DefaultConstraintValidation-impl.js").implementation;
const { formOwner } = require("../helpers/form-controls.js");
const { mixin } = require("../../utils.js");
const { descendantsByLocalNames } = require("../helpers/traversal.js");

const listedElements = new Set(["button", "fieldset", "input", "object", "output", "select", "textarea"]);

class HTMLFieldSetElementImpl extends HTMLElementImpl {
  constructor(globalObject, args, privateData) {
    super(globalObject, args, privateData);

    this._customValidityErrorMessage = "";
  }

  get elements() {
    return HTMLCollection.createImpl(this._globalObject, [], {
      element: this,
      query: () => descendantsByLocalNames(this, listedElements)
    });
  }

  get form() {
    return formOwner(this);
  }

  get type() {
    return "fieldset";
  }

  _barredFromConstraintValidationSpecialization() {
    return true;
  }
}

mixin(HTMLFieldSetElementImpl.prototype, DefaultConstraintValidationImpl.prototype);

module.exports = {
  implementation: HTMLFieldSetElementImpl
};
