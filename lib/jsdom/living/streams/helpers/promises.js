"use strict";

class PromiseCapability {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.pending = true;
  }

  resolve(value) {
    // The pending tracking only works if we never resolve the promises with
    // other promises. In this spec, that happens to be true for the promises in
    // question; they are always resolved with undefined.
    this.pending = false;
    this._resolve(value);
  }

  reject(reason) {
    this.pending = false;
    this._reject(reason);
  }

  static resolved(value) {
    const promiseCapability = new PromiseCapability();
    promiseCapability.resolve(value);
    return promiseCapability;
  }

  static rejected(reason) {
    const promiseCapability = new PromiseCapability();
    promiseCapability.reject(reason);
    return promiseCapability;
  }
}

function setPromiseIsHandledToTrue(promise) {
  promise.catch(() => {});
}

Object.assign(exports, {
  PromiseCapability,
  setPromiseIsHandledToTrue
});
