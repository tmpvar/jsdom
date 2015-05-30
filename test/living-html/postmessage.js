"use strict";

// Tests for window.postMessage(message, targetOrigin, transfer)
// Spec: https://html.spec.whatwg.org/#crossDocumentMessages

// TODO: Test that it clones the message
// TODO: Test that if object is transferred, it is marked 'stale' on the sending end

var jsdom = require("../..");
var injectIFrameWithScript = require("../util").injectIFrameWithScript;

exports["throws SyntaxError on invalid targetOrigin"] = function (test) {
  let document = jsdom.jsdom();
  let window = document.defaultView;
  let iframe = injectIFrameWithScript(document);

  window.onload = function () {
    test.throws(function () {
      iframe.contentWindow.postMessage("testMessage", "bogus targetOrigin");
    }, SyntaxError, "an invalid targetOrigin throws a SyntaxError");

    test.throws(function () {
      iframe.contentWindow.postMessage("testMessage");
    }, TypeError, "an missing targetOrigin throws a TypeError");

    test.done();
  };
};

exports["postMessage from iframe to parent"] = function (test) {
  let document = jsdom.jsdom();
  let window = document.defaultView;

  window.addEventListener("message", function (event) {
    window.postMessageReceived = event;
  });

  injectIFrameWithScript(document, `
    window.parent.postMessage("ack", "*");
  `);

  window.onload = function() {
    test.ok(window.postMessageReceived.data === "ack");
    test.done();
  };
};

exports["postMessage an object from iframe to parent"] = function (test) {
  let document = jsdom.jsdom();
  let window = document.defaultView;

  window.addEventListener("message", function (event) {
    window.postMessageReceived = event;
  });

  injectIFrameWithScript(document, `
    window.parent.postMessage({foo: "bar"}, "*");
  `);

  window.onload = function() {
    let event = window.postMessageReceived;
    test.ok(typeof event.data === "object");
    test.ok(event.data.foo === "bar");
    test.done();
  };
};

exports["postMessage from parent to iframe"] = function (test) {
  let document = jsdom.jsdom();
  let window = document.defaultView;

  let iframe = injectIFrameWithScript(document, `
    window.addEventListener("message", function (event) {
      window.parent.postMessageEvent = event;
    });
  `);

  window.onload = function () {
    iframe.contentWindow.postMessage("ack", "*");
  };

  setTimeout( function () {
    test.ok(window.postMessageEvent.data === "ack");
    test.done();
  }, 1e3);
};

exports["postMessage from iframe to iframe"] = function (test) {
  let document = jsdom.jsdom();
  let window = document.defaultView;

  window.iframeReceiver = injectIFrameWithScript(document, `
    window.addEventListener("message", function (event) {
      window.parent.postMessageEvent = event;
    });
  `);

  injectIFrameWithScript(document, `
    window.parent.iframeReceiver.contentWindow.postMessage("ack", "*");
  `);

  window.onload = function () {
    test.ok(window.postMessageEvent.data === "ack");
    test.done();
  };
};

exports["postMessage respects absolute URL targetOrigins"] = function (test) {
  // TODO: Explain why this can't be tested thoroughly as an integration test
  // TODO: Investigate whether unit testing this functionality is possible

  let document = jsdom.jsdom();
  let window = document.defaultView;

  window.iframeReceiver = injectIFrameWithScript(document, `
    window.addEventListener("message", function (event) {
      window.parent.postMessageEvent = event;
    });
  `);

  injectIFrameWithScript(document, `
    window.parent.iframeReceiver.contentWindow.postMessage("ack", "https://github.com");
  `);

  window.onload = function () {
    test.ok(window.postMessageEvent === undefined);
    test.done();
  };
};
