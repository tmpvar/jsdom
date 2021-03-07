"use strict";
const path = require("path");
const { describe, before, after } = require("mocha-sugar-free");
const { spawnSync } = require("child_process");
const { readManifest, getPossibleTestFilePaths } = require("./wpt-manifest-utils.js");
const startWPTServer = require("./start-wpt-server.js");

const wptPath = path.resolve(__dirname, "tests");
const testsPath = path.resolve(__dirname, "to-upstream");
const manifestFilename = path.resolve(__dirname, "tuwpt-manifest.json");

// We can afford to re-generate the manifest each time; we have few enough files that it's cheap.
const testsRootArg = path.relative(wptPath, testsPath);
const pathArg = path.relative(wptPath, manifestFilename);
const args = ["./wpt.py", "manifest", "--tests-root", testsRootArg, "--path", pathArg];
spawnSync("python", args, { cwd: wptPath, stdio: "inherit" });

const manifest = readManifest(manifestFilename);
const possibleTestFilePaths = getPossibleTestFilePaths(manifest);

let wptServerURL;
const runSingleWPT = require("./run-single-wpt.js")(() => wptServerURL);
const wptServerPromise = startWPTServer({ toUpstream: true });
const serverProcess = wptServerPromise.child;

describe("Local tests in web-platform-test format (to-upstream)", () => {
  before({ timeout: 30 * 1000 }, async () => {
    wptServerURL = await wptServerPromise;
  });

  for (const test of possibleTestFilePaths) {
    runSingleWPT(test);
  }
});

after(() => {
  // Python doesn't register a default handler for SIGTERM and it doesn't run __exit__() methods of context
  // managers when it gets that signal. Using SIGINT avoids this problem.
  serverProcess.kill("SIGINT");
});
