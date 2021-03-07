"use strict";
/* eslint-disable no-console, global-require */
const dns = require("dns");
const path = require("path");
const util = require("util");
const childProcess = require("child_process");
const requestHead = require("request-promise-native").head;
const { inBrowserContext } = require("../util.js");

const dnsLookup = util.promisify(dns.lookup);

const wptDir = path.resolve(__dirname, "tests");

const configPaths = {
  default: path.resolve(__dirname, "wpt-config.json"),
  toUpstream: path.resolve(__dirname, "tuwpt-config.json")
};

const configs = {
  default: require(configPaths.default),
  toUpstream: require(configPaths.toUpstream)
};

module.exports = ({ toUpstream = false } = {}) => {
  if (inBrowserContext()) {
    return Promise.resolve();
  }

  const configType = toUpstream ? "toUpstream" : "default";
  const configPath = configPaths[configType];
  const config = configs[configType];

  const configArg = path.relative(path.resolve(wptDir), configPath);
  const args = ["./wpt.py", "serve", "--config", configArg];
  let subprocess;

  const result = new Promise((resolve, reject) => {
    subprocess = childProcess.spawn("python", args, {
      cwd: wptDir,
      stdio: "inherit"
    });

    subprocess.on("error", e => {
      reject(new Error(`Error starting python server process: ${e.message}`));
    });

    process.on("exit", () => {
      // Python doesn't register a default handler for SIGTERM and it doesn't run __exit__() methods of context
      // managers when it gets that signal. Using SIGINT avoids this problem.
      subprocess.kill("SIGINT");
    });

    dnsLookup("web-platform.test")
      .then(
        () => Promise.all([
          pollForServer(`http://${config.browser_host}:${config.ports.http[0]}/`),
          pollForServer(`https://${config.browser_host}:${config.ports.https[0]}/`),
          pollForServer(`http://${config.browser_host}:${config.ports.ws[0]}/`),
          pollForServer(`https://${config.browser_host}:${config.ports.wss[0]}/`)
        ]),
        () => {
          throw new Error("Host entries not present for web platform tests. See " +
                          "https://github.com/web-platform-tests/wpt#running-the-tests");
        }
      )
      .then(urls => resolve(urls[0]), reject);
  });

  result.child = subprocess;

  return result;
};

function pollForServer(url, lastLogTime = Date.now()) {
  return requestHead(url, { strictSSL: false })
    .then(() => {
      console.log(`WPT server at ${url} is up!`);
      return url;
    })
    .catch(err => {
      // Only log every 5 seconds to be less spammy.
      if (Date.now() - lastLogTime >= 5000) {
        console.log(`WPT server at ${url} is not up yet (${err.message}); trying again`);
        lastLogTime = Date.now();
      }

      return new Promise(resolve => {
        setTimeout(() => resolve(pollForServer(url, lastLogTime)), 500);
      });
    });
}
