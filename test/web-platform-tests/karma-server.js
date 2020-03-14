"use strict";
/* eslint-disable no-console */
const express = require("express");
const startWPTServer = require("./start-wpt-server.js");

if (require.main === module) {
  const falsyString = /^(false|0n?|null|undefined|NaN)??$/;
  function parseQuery(query) {
    const result = { toUpstream: false };
    if ("to-upstream" in query) {
      let toUpstream = query["to-upstream"];
      if (typeof toUpstream === "string") {
        toUpstream = toUpstream.trim();
        result.toUpstream = !falsyString.test(toUpstream);
      }
    }
    return result;
  }

  const app = express();

  app.get("/", (req, res) => res.sendStatus(200));

  app.head("/start-wpt-server", (req, res) => {
    const query = parseQuery(req.query);
    console.log(`HEAD for WPT server with query ${JSON.stringify(query)}`);

    res.setHeader("X-JSDOM-WPT-Directory", query.toUpstream ? "to-upstream" : "tests");
    res.status(200).send();
  });

  app.get("/start-wpt-server", (req, res) => {
    const query = parseQuery(req.query);
    console.log(`Starting WPT server with query ${JSON.stringify(query)}`);

    res.setHeader("X-JSDOM-WPT-Directory", query.toUpstream ? "to-upstream" : "tests");
    res.contentType("text/plain");
    startWPTServer(query).then(
      url => {
        res.status(200).send(url);
        console.log(`Sending '200 OK' response with payload:`, url);
      },
      reason => {
        res.status(500).send(reason);
        console.error(`Sending '500 Internal Server Error': Failed to start WPT server:`, reason);
      }
    );
  });

  app.get("/*", (req, res) => res.sendStatus(404));
  app.listen(8000, "0.0.0.0");

  console.log(`Serving JSDOM Web Platform Tests API on \`http://0.0.0.0:8000/\``);
}
