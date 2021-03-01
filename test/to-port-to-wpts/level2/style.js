"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const { assert } = require("chai");
const { beforeEach, afterEach, describe, specify } = require("mocha-sugar-free");

const { JSDOM } = require("../../..");
const { createServer, delay } = require("../../util.js");

describe("level2/style", { skipIfBrowser: true }, () => {
  specify("HTMLStyleElement01", () => {
    const { window } = new JSDOM(`<html><head><style>p{color:red}</style></head><body>`);
    const style = window.document.head.lastChild;
    assert.equal(style.sheet.cssRules.length, 1);
    assert.equal(style.sheet.cssRules[0].selectorText, "p");
    assert.equal(style.sheet.cssRules[0].style.color, "red");
  });

  specify("HTMLStyleElement02", () => {
    const { window } = new JSDOM(`
      <!doctype html><html><head>
      <style>p { color: green; }</style>
      <style>div { color: red; }</style>
      <script>
        var style2 = document.getElementsByTagName('style')[1];
        style2.parentNode.removeChild(style2);
      </script>
    `, { runScripts: "dangerously" });

    assert.equal(window.document.getElementsByTagName("style").length, 1);
    assert.equal(window.document.styleSheets.length, 1);
  });

  specify("HTMLStyleAttribute01", () => {
    const { window } = new JSDOM(`<html><body><p style="color:red; background-color: blue">`);
    var p = window.document.body.lastChild;
    assert.equal(2, p.style.length);
    assert.equal("color", p.style[0]);
    assert.equal("red", p.style.color);
    assert.equal("background-color", p.style[1]);
    assert.equal("blue", p.style.backgroundColor);
  });

  specify("HTMLCanvasStyleAttribute01", () => {
    const { window } = new JSDOM(`<html><body><canvas style="background-color: blue; z-index:1">`);
    var c = window.document.body.lastChild;
    assert.equal(2, c.style.length);
    assert.equal("background-color", c.style[0]);
    assert.equal("blue", c.style.backgroundColor);
    assert.equal("z-index", c.style[1]);
    assert.equal(1, c.style.zIndex);
  });

  specify("StylePropertyReflectsStyleAttribute", () => {
    const { window } = new JSDOM();
    var p = window.document.createElement("p");
    p.setAttribute("style", "color:red");
    assert.equal(1, p.style.length);
    assert.equal("color", p.style[0]);
    assert.equal("red", p.style.color);
    p.setAttribute("style", "");
    assert.equal(0, p.style.length);
    assert.equal("", p.style.color);
    p.setAttribute("style", "color:blue");
    assert.equal("color", p.style[0]);
    assert.equal("blue", p.style.color);
  });

  specify("StyleAttributeReflectsStyleProperty", () => {
    const { window } = new JSDOM();
    var p = window.document.createElement("p");
    p.style.setProperty("color", "red");
    assert.equal(p.getAttribute("style"), "color: red;");
    p.style.setProperty("width", "20px");
    assert.equal(p.getAttribute("style"), "color: red; width: 20px;");
    p.style.removeProperty("color");
    assert.equal(p.getAttribute("style"), "width: 20px;");
    p.style.removeProperty("width");
    assert.equal(p.getAttribute("style"), "");
    p.style.cssText = "background-color: blue; z-index: 12;";
    assert.equal(2, p.style.length);
    assert.equal("blue", p.style.backgroundColor);
    assert.equal("12", p.style.zIndex);
    p.style.removeProperty("z-index");
    assert.equal(1, p.style.length);
    p.style.backgroundColor = "green";
    assert.equal("background-color: green;", p.style.cssText);
    assert.equal("background-color", p.style.item(0));
  });

  specify("StyleShorthandProperties", () => {
    const { window } = new JSDOM();
    var p = window.document.createElement("p");
    p.style.border = "1px solid black";
    assert.equal(1, p.style.length);
    assert.equal("1px solid black", p.style.border);
    assert.equal("1px", p.style.borderWidth);
    assert.equal("solid", p.style.borderStyle);
    assert.equal("black", p.style.borderColor);
    assert.equal("border: 1px solid black;", p.style.cssText);
    assert.equal('<p style="border: 1px solid black;"></p>', p.outerHTML);
  });

  specify("retainOriginalStyleAttributeUntilStyleGetter", () => {
    const { window } = new JSDOM();
    var document = window.document;
    var div = document.createElement("div");
    div.setAttribute("style", "font-weight: bold; font-weight: normal;");
    assert.equal(div.getAttribute("style"), "font-weight: bold; font-weight: normal;");
    div.innerHTML = "<div style=\"color: red; color: blue;\"></div>";
    assert.equal(div.innerHTML, "<div style=\"color: red; color: blue;\"></div>");
    assert.equal(div.firstChild.getAttribute("style"), "color: red; color: blue;");
    div.firstChild.style.color = "maroon";
    assert.equal(div.firstChild.getAttribute("style"), "color: maroon;");
  });

  specify("getComputedStyleFromDefaultStylesheet1", () => {
    // browsers have default stylesheets, see https://github.com/jsdom/jsdom/issues/994
    var { window } = new JSDOM("<html><head></head><body><div></div></body></html>");
    var div = window.document.getElementsByTagName("div")[0];
    var cs = window.getComputedStyle(div);
    assert.equal(cs.display, "block", "computed display of div is block by default");
  });

  specify("getComputedStyleFromDefaultStylesheet2", () => {
    // browsers have default stylesheets, see https://github.com/jsdom/jsdom/issues/994
    var { window } = new JSDOM("<html><head></head><body><ul></ul></body></html>");
    var ul = window.document.getElementsByTagName("ul")[0];
    var cs = window.getComputedStyle(ul);
    assert.equal(cs.display, "block", "computed display of ul is block by default");
  });

  specify("getComputedStyleInline", () => {
    const { window } = new JSDOM();
    var document = window.document;
    var style = document.createElement("style");
    style.innerHTML = "p { display: none; }";
    document.getElementsByTagName("head")[0].appendChild(style);
    var p = document.createElement("p");
    document.body.appendChild(p);
    p = document.getElementsByTagName("p")[0];
    var cs = window.getComputedStyle(p);
    assert.equal(cs.display, "none", "computed display of p is none");
  });

  specify("getComputedStyleFromEmbeddedSheet1", () => {
    const { window } = new JSDOM(`
      <html><head><style>#id1 .clazz { margin-left: 100px; }</style></head><body>
      <div id="id1"><p class="clazz"></p></div>
      </body></html>`);
    var p = window.document.getElementsByTagName("p")[0];
    var cs = window.getComputedStyle(p);
    assert.equal(cs.marginLeft, "100px", "computed marginLeft of p[0] is 100px");
  });

  specify("getComputedStyleFromEmbeddedSheet2", () => {
    // use grouping, see http://www.w3.org/TR/CSS2/selector.html#grouping
    const { window } = new JSDOM(`
        <html><head><style>#id1 .clazz, #id2 .clazz { margin-left: 100px; }</style></head><body>
        <div id="id1"><p class="clazz"></p></div>
        <div id="id2"><p class="clazz"></p></div>
        </body></html>`);
    var p = window.document.getElementsByTagName("p")[0];
    var cs = window.getComputedStyle(p);
    assert.equal(cs.marginLeft, "100px", "computed marginLeft of p[0] is 100px");

    p = window.document.getElementsByTagName("p")[1];
    cs = window.getComputedStyle(p);
    assert.equal(cs.marginLeft, "100px", "computed marginLeft of p[1] is 100px");
  });

  specify("getComputedStyleFromEmbeddedSheet3", () => {
    // use grouping with embedded quotes and commas, see https://github.com/jsdom/jsdom/pull/541#issuecomment-18114747
    const { window } = new JSDOM(`
        <html><head><style>#id1 .clazz, button[onclick="ga(this, event)"],
        #id2 .clazz { margin-left: 100px; }</style></head><body>
        <div id="id1"><p class="clazz"></p></div>
        <div id="id2"><p class="clazz"></p></div>
        <button onclick="ga(this, event)">analytics button</button>
        </body></html>`);
    var p = window.document.getElementsByTagName("p")[1];
    var cs = window.getComputedStyle(p);
    assert.equal(cs.marginLeft, "100px", "computed marginLeft of p[1] is 100px");

    var button = window.document.getElementsByTagName("button")[0];
    cs = window.getComputedStyle(button);
    assert.equal(cs.marginLeft, "100px", "computed marginLeft of button[0] is 100px");
  });

  specify("ensureRelativeStylesheetFilesAreLoaded", () => {
    return createServer((req, res) => {
      try {
        var content = String(fs.readFileSync(path.resolve(__dirname, "style", req.url.substring(1))));
        res.writeHead(200, {
          "Content-type": req.url.endsWith(".css") ? "text/css" : "text/html",
          "Content-length": content.length
        });
        res.end(content);
      } catch (exc) {
        res.writeHead(404, "not found");
        res.end();
      }
    }).then(s => {
      return JSDOM.fromURL(`http://127.0.0.1:${s.address().port}/relative_import.html`, { resources: "usable" }).then(({ window }) => {
        return new Promise(resolve => {
          window.onload = resolve;
        }).then(() => {
          return delay(100); // HACK: style imports haven"t been processed yet, different bug
        }).then(() => {
          var style = window.getComputedStyle(window.document.body);
          assert.equal(style.color, "rgb(255, 0, 0)", "computed color of body is red");
          s.close();
        });
      });
    });
  });

  specify("getComputedStyleExternal", () => {
    return createServer((req, res) => {
      const css = `div { color: red; }`;
      res.writeHead(200, {
        "Content-type": "text/css",
        "Content-length": css.length
      });
      res.end(css);
    }).then(s => {
      const { window } = new JSDOM(`<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">
      <html> <head>
      <title>test</title>
      <link rel='stylesheet' href='http://127.0.0.1:${s.address().port}/style.css'/>
      </head>

      <body>
      <div>displayed</div>
      <p>no displayed</p>

      </body>
      </html>`, { resources: "usable"});
      return new Promise(resolve => {
        window.onload = () => {
          var div = window.document.getElementsByTagName("div")[0];
          var style = window.getComputedStyle(div);
          assert.equal(style.color, "rgb(255, 0, 0)", "computed color of div is red");
          s.close();
          resolve();
        };
      });
    });
  });

  specify("getComputedStyleWithBadSelectors", () => {
    const { window } = new JSDOM();
    var doc = window.document;
    var style = doc.createElement("style");
    style.innerHTML = ";p { display: none; }";
    doc.getElementsByTagName("head")[0].appendChild(style);
    var p = doc.createElement("p");
    doc.body.appendChild(p);
    p = doc.getElementsByTagName("p")[0];
    assert.doesNotThrow(function () {
      window.getComputedStyle(p);
    });
  });

  specify("getComputedStyleWithMediaRules", () => {
    const { window } = new JSDOM(`
      <html><head><style>@media screen,handheld { .citation { color: blue; } }
      @media print { .citation { color: red; } }</style></head>
      <body><p class=\"citation\">Hello</p></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector(".citation"));
    assert.equal(style.color, "rgb(0, 0, 255)", "computed color of p is blue");
  });

  specify("getComputedStyleWithKeyframeRules", () => {
    const { window } = new JSDOM(`
      <html><head><style>@-webkit-keyframes breaking {}</style></head>
      <body><p>Hello</p></body></html>`);
    assert.doesNotThrow(function () {
      window.getComputedStyle(window.document.querySelector("p"));
    });
  });

  specify("getComputedStyleWithColorInheritance1", () => {
    const { window } = new JSDOM(`
      <html><head><style>div { color: green; }</style></head>
      <body><div><span>hello</span></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("span"));
    assert.equal(style.color, "rgb(0, 128, 0)", "computed color of span is green");
  });

  specify("getComputedStyleWithColorInheritance2", () => {
    const { window } = new JSDOM(`
      <html><head><style>div { color: green; }</style></head>
      <body><div><a href="foobar"><span>hello</span></a></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("span"));
    assert.equal(style.color, "rgb(0, 0, 238)", "computed color of span is default link color");
  });

  specify("getComputedStyleWithFillInheritance1", () => {
    const { window } = new JSDOM(`
      <html><head><style></style></head>
      <body><div><svg></svg></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("svg"));
    assert.equal(style.fill, "rgb(0, 0, 0)", "computed color of svg is default");
  });

  specify("getComputedStyleWithFillInheritance2", () => {
    const { window } = new JSDOM(`
      <html><head><style>div { fill: green; }</style></head>
      <body><div><svg></svg></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("svg"));
    assert.equal(style.fill, "rgb(0, 128, 0)", "computed color of svg is green");
  });

  specify("getComputedStyleWithStrokeInheritance1", () => {
    const { window } = new JSDOM(`
      <html><head><style></style></head>
      <body><div><svg></svg></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("svg"));
    assert.equal(style.stroke, "none", "computed color of svg is default");
  });

  specify("getComputedStyleWithStrokeInheritance2", () => {
    const { window } = new JSDOM(`
      <html><head><style>div { stroke: green; }</style></head>
      <body><div><svg></svg></div></body></html>`);
    var style = window.getComputedStyle(window.document.querySelector("svg"));
    assert.equal(style.stroke, "rgb(0, 128, 0)", "computed color of svg is green");
  });

  specify("setStyleToInvalidCSSSyntax", () => {
    const node = (new JSDOM()).window.document.createElement("div");

    const invalidStyles = [
      "color: red; }",
      "color: \"red",
      "color: red;' ",
      "color: red; /*",
      "color: attr(",
      "color: ",
      "color: /*red"
    ];

    invalidStyles.forEach(function (style) {
      node.setAttribute("style", "color: red");
      assert.doesNotThrow(function () {
        node.setAttribute("style", style);
      });
      assert.strictEqual(node.getAttribute("style"), style);
      assert.strictEqual(node.style.color, "");
      assert.strictEqual(node.style.cssText, "");

      node.style.cssText = "color: red";
      assert.doesNotThrow(function () {
        node.style.cssText = style;
      });
      assert.strictEqual(node.style.color, "");
      assert.strictEqual(node.style.cssText, "");
    });

  });

  specify("getStyleSheetByItem", (t) => {
    const { window } = new JSDOM(`<html><head><style>p{color:red}</style><style>div{color:green}</style></head><body>`);
    var sheets = window.document.styleSheets;
    assert.equal(2, sheets.length);
    assert.equal(sheets[0], sheets.item(0));
    assert.equal(sheets[1], sheets.item(1));
    assert.equal("red", sheets.item(0).cssRules[0].style.color);
    assert.equal("green", sheets.item(1).cssRules[0].style.color);
  });

  specify("parseStyleWithBogusComment", () => {
    // https://github.com/jsdom/jsdom/issues/1214
    const { window } = new JSDOM(`<style>.block-title .block-title-inner a:visited { color: #48484d; } // MAIN MENU - (used to keep mobile menu options hidden and keep weather/search and menu on one line) // #tncms-region-nav-main-nav-right-nav { float:left; }</style>`);

    // Should not hang forever
    window.getComputedStyle(window.document.body);
  });

  specify("padding and margin component properties work correctly (GH-1353)", () => {
    const document = (new JSDOM()).window.document;

    for (const prop of ["padding", "margin"]) {
      document.body.style[prop] = "1px 2px 3px 4px";

      assert.strictEqual(document.body.style[prop], "1px 2px 3px 4px");
      assert.strictEqual(document.body.style[prop + "Top"], "1px");
      assert.strictEqual(document.body.style[prop + "Right"], "2px");
      assert.strictEqual(document.body.style[prop + "Bottom"], "3px");
      assert.strictEqual(document.body.style[prop + "Left"], "4px");

      document.body.style[prop + "Top"] = "1em";
      document.body.style[prop + "Right"] = "2em";
      document.body.style[prop + "Bottom"] = "3em";
      document.body.style[prop + "Left"] = "4em";
      assert.strictEqual(document.body.style[prop], "1em 2em 3em 4em");

      document.body.style[prop] = "1mm";
      assert.strictEqual(document.body.style[prop], "1mm");
      assert.strictEqual(document.body.style[prop + "Top"], "1mm");
      assert.strictEqual(document.body.style[prop + "Right"], "1mm");
      assert.strictEqual(document.body.style[prop + "Bottom"], "1mm");
      assert.strictEqual(document.body.style[prop + "Left"], "1mm");

      document.body.style[prop] = "1% 2%";
      assert.strictEqual(document.body.style[prop], "1% 2%");
      assert.strictEqual(document.body.style[prop + "Top"], "1%");
      assert.strictEqual(document.body.style[prop + "Right"], "2%");
      assert.strictEqual(document.body.style[prop + "Bottom"], "1%");
      assert.strictEqual(document.body.style[prop + "Left"], "2%");

      document.body.style[prop] = "3pc 2pc 1pc";
      assert.strictEqual(document.body.style[prop], "3pc 2pc 1pc");
      assert.strictEqual(document.body.style[prop + "Top"], "3pc");
      assert.strictEqual(document.body.style[prop + "Right"], "2pc");
      assert.strictEqual(document.body.style[prop + "Bottom"], "1pc");
      assert.strictEqual(document.body.style[prop + "Left"], "2pc");
    }
  });

  specify("StyleSheetList.prototype.item returns null on index out of bounds", () => {
    const document = (new JSDOM()).window.document;
    assert.strictEqual(document.styleSheets[0], undefined);
    assert.strictEqual(document.styleSheets.item(0), null);
  });

  specify("setting background to null works correctly (GH-1499)", () => {
    const document = (new JSDOM()).window.document;
    document.body.innerHTML = `<div id="ctrl" style="background:#111;border:1px"></div>`;

    const div = document.body.firstChild;
    div.style.background = null;

    assert.strictEqual(div.style.background, "");
  });

  specify("setting width to auto works correctly (GH-1458)", () => {
    const document = (new JSDOM()).window.document;

    document.body.style.width = "auto";

    assert.strictEqual(document.body.style.width, "auto");
    assert.strictEqual(document.body.style.cssText, "width: auto;");
  });
});
