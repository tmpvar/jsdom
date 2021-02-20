"use strict";
const HTMLElementImpl = require("./HTMLElement-impl.js").implementation;
const DefaultConstraintValidationImpl =
  require("../constraint-validation/DefaultConstraintValidation-impl.js").implementation;
const { mixin } = require("../../utils.js");
const { formOwner } = require("../helpers/form-controls.js");

class HTMLObjectElementImpl extends HTMLElementImpl {
  get form() {
    return formOwner(this);
  }

  get contentDocument() {
    return null;
  }

  _barredFromConstraintValidationSpecialization() {
    return true;
  }
}

mixin(HTMLObjectElementImpl.prototype, DefaultConstraintValidationImpl.prototype);

module.exports = {
  implementation: HTMLObjectElementImpl
};
