"use strict";
const fs = require("fs");

const EXPECTED_MANIFEST_VERSION = 8;

exports.getPossibleTestFilePaths = manifest => {
  const testharnessTests = manifest.items.testharness;

  // Do a DFS to gather all test paths.
  const allPaths = [];
  function addTests(test, path) {
    for (const key of Object.keys(test)) {
      if (Array.isArray(test[key])) {
        const fallbackPath = path === "" ? key : `${path}/${key}`;

        for (const [curPath] of test[key].slice(1)) {
          const testPath = curPath === null ? fallbackPath : curPath;

          // Globally disable worker tests
          if (testPath.endsWith(".worker.html") ||
              testPath.endsWith(".serviceworker.html") ||
              testPath.endsWith(".sharedworker.html")) {
            continue;
          }
          allPaths.push(testPath);
        }
      } else {
        const curPath = path === "" ? key : `${path}/${key}`;
        addTests(test[key], curPath);
      }
    }
  }
  addTests(testharnessTests, "");

  return allPaths;
};

exports.readManifest = filename => {
  const manifestString = fs.readFileSync(filename, { encoding: "utf-8" });
  return exports.parseManifest(manifestString);
};

exports.parseManifest = manifestString => {
  const manifest = JSON.parse(manifestString);

  if (manifest.version !== EXPECTED_MANIFEST_VERSION) {
    throw new Error(`WPT manifest format mismatch; expected ${EXPECTED_MANIFEST_VERSION} but got ${manifest.version}`);
  }

  return manifest;
};
