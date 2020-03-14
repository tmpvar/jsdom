/* eslint no-process-env:0 no-console:0 */
"use strict";

const nodePath = require("path");

module.exports = config => {
  const options = {
    basePath: nodePath.resolve(__dirname, ".."),
    frameworks: ["mocha", "browserify", "child-process"],

    files: [
      {
        pattern: "lib/**",
        watched: true,
        served: false,
        included: false
      },
      {
        // this directory is served so that we can test fetching fixtures
        // make sure that this pattern does not match the entry point test/index.js
        // otherwise we hit node-browserify#1003
        pattern: "test/!(web-platform-tests)/**",
        served: true,
        watched: true,
        included: false
      },
      {
        pattern: "test/web-platform-tests/@(to-run.yaml|wpt-manifest.json)",
        served: true,
        watched: true,
        included: false
      },
      {
        pattern: "test/index.js",
        watched: false,
        served: true,
        included: true
      }
    ],

    preprocessors: {
      "test/index.js": ["browserify"]
    },

    browserify: {
      debug: true,
      configure(bundle) {
        // TODO: support to-upstream WPTs in browsers.
        bundle.ignore("./test/web-platform-tests/run-tuwpts.js");

        bundle.ignore("./test/web-platform-tests/wpt-configs.js");
        bundle.ignore("./test/web-platform-tests/*.json");
      }
    },

    client: {
      childProcess: {
        path: "test/web-platform-tests/karma-server.js",
        args: [],
        options: {}
      }
    },

    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,

    browsers: ["ChromeHeadless"],
    singleRun: true
  };

  config.set(options);
};
