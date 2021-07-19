#!/usr/bin/env node
"use strict";
/* eslint-disable no-console */

const consoleReporter = require("./console-reporter");
const pathToSuites = require("./path-to-suites");
const benchmarks = require(".");
const fs = require("fs");
const path = require("path");
const { toFileUrl } = require("../lib/jsdom/utils");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { argv } = yargs(hideBin(process.argv))
  .usage("Run the jsdom benchmark suite")
  .option("suites", {
    type: "array",
    alias: "s",
    describe: "suites that you want to run, e.g.: dom/construction/createElement dom/foo"
  })
  .option("bundle", {
    type: "boolean",
    describe: "generate the JavaScript bundle required to run benchmarks in a browser"
  })
  .help();

if (argv.bundle) {
  const bundle = require("browserify")({ debug: true });
  bundle.require(path.resolve(__dirname, ".."), { expose: "jsdom" });
  bundle.require(path.resolve(__dirname, "browser-runner.js"), { expose: "jsdom-browser-runner" });

  bundle.bundle()
    .pipe(fs.createWriteStream(path.resolve(__dirname, "browser-bundle.js")))
    .on("finish", () => {
      console.info(
        "Open the following page in Chrome to begin benchmarking:",
        toFileUrl(path.resolve(__dirname, "browser-runner.html"))
      );
    });
  return;
}

let suitesToRun;
if (argv.suites) {
  suitesToRun = pathToSuites(benchmarks, argv.suites);
} else {
  suitesToRun = pathToSuites(benchmarks);
}

suitesToRun.forEach(consoleReporter);

function runNext() {
  /* eslint-disable no-invalid-this */
  if (this && this.off) {
    // there is no .once()
    this.off("complete", runNext);
  }
  /* eslint-enable no-invalid-this */

  const suite = suitesToRun.shift();
  if (!suite) {
    console.log("Done!");
    return;
  }

  suite.off("complete", runNext);
  suite.on("complete", runNext);
  suite.run({ async: true });
}

runNext();
