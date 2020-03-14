"use strict";
const path = require("path");
const fs = require("fs");
const jsYAML = require("js-yaml");
const { Minimatch } = require("minimatch");
const { describe, specify, before } = require("mocha-sugar-free");
const { readManifest, parseManifest, getPossibleTestFilePaths } = require("./wpt-manifest-utils.js");
const startWPTServer = require("./start-wpt-server.js");
const { inBrowserContext, karmaPort, wptServerTimeout } = require("../util.js");
const { Canvas } = require("../../lib/jsdom/utils.js");

const isInBrowser = inBrowserContext();
const validReasons = new Set([
  "fail",
  "fail-slow",
  "fail-with-canvas",
  "timeout",
  "flaky",
  "needs-node10",
  "needs-node11",
  "needs-node12",
  "needs-canvas"
]);

const nodeMajor = typeof process.versions.node === "string" ?
  Number(process.versions.node.split(".")[0]) :
  null;
const hasNode10 = nodeMajor >= 10;
const hasNode11 = nodeMajor >= 11;
const hasNode12 = nodeMajor >= 12;
const hasCanvas = Boolean(Canvas);

const manifestFilename = path.resolve(__dirname, "wpt-manifest.json");
const toRunFilename = path.resolve(__dirname, "to-run.yaml");

let toRunString;
let manifest;
if (!isInBrowser) {
  manifest = readManifest(manifestFilename);
  toRunString = fs.readFileSync(toRunFilename, { encoding: "utf-8" });
} else {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest();

  // This needs to use sync XHR, otherwise `toRunDocs` and `manifest`
  // would be `undefined` when the `describe` callback executes:
  xhr.open("GET", `http://localhost:${karmaPort}/base/test/web-platform-tests/to-run.yaml`, false);
  xhr.send();
  toRunString = xhr.responseText;

  xhr.open("GET", `http://localhost:${karmaPort}/base/test/web-platform-tests/wpt-manifest.json`, false);
  xhr.send();
  manifest = parseManifest(xhr.responseText);
}
const toRunDocs = jsYAML.safeLoadAll(toRunString, null, { filename: toRunFilename });
const possibleTestFilePaths = getPossibleTestFilePaths(manifest);

const minimatchers = new Map();

checkToRun();

let wptServerURL;
const runSingleWPT = require("./run-single-wpt.js")(() => wptServerURL);
const wptServerPromise = startWPTServer({ toUpstream: false }).then(url => {
  wptServerURL = url;
});

describe("web-platform-tests", () => {
  before({ timeout: wptServerTimeout }, () => wptServerPromise);

  for (const toRunDoc of toRunDocs) {
    describe(toRunDoc.DIR, () => {
      for (const testFilePath of possibleTestFilePaths) {
        if (testFilePath.startsWith(toRunDoc.DIR + "/")) {
          const matchingPattern = expectationsInDoc(toRunDoc).find(pattern => {
            const matcher = minimatchers.get(toRunDoc.DIR + "/" + pattern);
            return matcher.match(testFilePath);
          });

          const testFile = testFilePath.slice((toRunDoc.DIR + "/").length);
          const reason = matchingPattern && toRunDoc[matchingPattern][0];
          const shouldSkip = ["fail-slow", "timeout", "flaky"].includes(reason) ||
                             (["fail-with-canvas", "needs-canvas"].includes(reason) && !hasCanvas);
          const expectFail = (reason === "fail") ||
                             (reason === "fail-with-canvas" && hasCanvas) ||
                             (reason === "needs-node10" && !hasNode10) ||
                             (reason === "needs-node11" && !hasNode11) ||
                             (reason === "needs-node12" && !hasNode12);

          if (matchingPattern && shouldSkip) {
            specify.skip(`[${reason}] ${testFile}`);
          } else if (expectFail) {
            const failReason = reason !== "fail" ? `: ${reason}` : "";
            runSingleWPT(testFilePath, `[expected fail${failReason}] ${testFile}`, expectFail);
          } else {
            runSingleWPT(testFilePath, testFile, expectFail);
          }
        }
      }
    });
  }
});

function checkToRun() {
  let lastDir = "";
  for (const doc of toRunDocs) {
    if (doc.DIR.startsWith("/")) {
      throw new Error(`DIR entries must not start with a slash: saw "${doc.DIR}"`);
    }
    if (doc.DIR.endsWith("/")) {
      throw new Error(`DIR entries must not end with a slash: saw "${doc.DIR}"`);
    }

    if (!isInBrowser && !fs.existsSync(path.resolve(__dirname, "tests", doc.DIR))) {
      throw new Error(`The directory "${doc.DIR}" does not exist`);
    }

    if (doc.DIR < lastDir) {
      throw new Error(`Bad lexicographical directory sorting in to-run.yaml: ${doc.DIR} should come before ${lastDir}`);
    }
    lastDir = doc.DIR;

    let lastPattern = "";
    for (const pattern of expectationsInDoc(doc)) {
      if (pattern.startsWith("/")) {
        throw new Error(`Expectation patterns must not start with a slash: saw "${pattern}"`);
      }

      if (pattern < lastPattern) {
        throw new Error("Bad lexicographical expectation pattern sorting in to-run.yaml: " + pattern +
                        " should come before " + lastPattern);
      }
      lastPattern = pattern;

      const reason = doc[pattern][0];
      if (!validReasons.has(reason)) {
        throw new Error(`Bad reason "${reason}" for expectation ${pattern}`);
      }

      const matcher = new Minimatch(doc.DIR + "/" + pattern);
      if (!possibleTestFilePaths.some(filename => matcher.match(filename))) {
        throw new Error(`Expectation pattern "${pattern}" does not match any test files`);
      }
      minimatchers.set(doc.DIR + "/" + pattern, matcher);
    }
  }
}

function expectationsInDoc(doc) {
  const keys = Object.keys(doc);
  keys.shift(); // get rid of the DIR key
  return keys;
}
