"use strict";
// This includes all tests that are run using Mocha, including web-platform-tests.
// Whether a test runs in Node, the browser, or both is determined using annotations inside each test.

require("./css/basics.js");

require("./api/basics.js");
require("./api/cookies.js");
require("./api/encoding.js");
require("./api/fragment.js");
require("./api/from-file.js");
require("./api/from-outside.js");
require("./api/from-url.js");
require("./api/jsdom-errors.js");
require("./api/methods.js");
require("./api/options.js");
require("./api/options-run-scripts.js");
require("./api/resources.js");
require("./api/virtual-console.js");

require("./helper-unit-tests/named-properties-tracker.js");
require("./helper-unit-tests/utils.js");

require("./to-port-to-wpts/class-list.js");
require("./to-port-to-wpts/current-script.js");
require("./to-port-to-wpts/dom-implementation.js");
require("./to-port-to-wpts/frame.js");
require("./to-port-to-wpts/history.js");
require("./to-port-to-wpts/htmlanchorelement.js");
require("./to-port-to-wpts/htmlcanvaselement.js");
require("./to-port-to-wpts/htmlelement.js");
require("./to-port-to-wpts/htmlimageelement.js");
require("./to-port-to-wpts/htmlinputelement.js");
require("./to-port-to-wpts/inline-event-handlers.js");
require("./to-port-to-wpts/inside-worker-smoke-tests.js");
require("./to-port-to-wpts/jsonp.js");
require("./to-port-to-wpts/location.js");
require("./to-port-to-wpts/message-event.js");
require("./to-port-to-wpts/misc.js");
require("./to-port-to-wpts/misc2.js");
require("./to-port-to-wpts/namespaces.js");
require("./to-port-to-wpts/node-clone-node.js");
require("./to-port-to-wpts/node-iterator.js");
require("./to-port-to-wpts/node-owner-document.js");
require("./to-port-to-wpts/non-document-type-child-node.js");
require("./to-port-to-wpts/on-error.js");
require("./to-port-to-wpts/parent-node.js");
require("./to-port-to-wpts/parsing.js");
require("./to-port-to-wpts/post-message.js");
require("./to-port-to-wpts/query-selector-all.js");
require("./to-port-to-wpts/query-selector.js");
require("./to-port-to-wpts/script.js");
require("./to-port-to-wpts/selectors.js");
require("./to-port-to-wpts/serialization.js");
require("./to-port-to-wpts/xhr-file-urls.js");
require("./to-port-to-wpts/xml.js");

require("./to-port-to-wpts/level1/core.js");
require("./to-port-to-wpts/level1/html.js");

require("./to-port-to-wpts/level2/core.js");
require("./to-port-to-wpts/level2/events.js");
require("./to-port-to-wpts/level2/html.js");
require("./to-port-to-wpts/level2/style.js");

require("./to-port-to-wpts/level3/textContent.js");
require("./to-port-to-wpts/level3/xpath.js");

require("./web-platform-tests/run-tuwpts.js");
// Keep this one last so that you can cancel the test run early.
require("./web-platform-tests/run-wpts.js");
