"use strict";
const fs = require("fs");
const path = require("path");

const parseDataURL = require("data-urls");
const { assert } = require("chai");
const { describe, specify } = require("mocha-sugar-free");
const { PNG } = require("pngjs");

const { JSDOM } = require("../..");
const { isCanvasInstalled } = require("../util.js");

// Tests for the HTML canvas element
// Spec: https://html.spec.whatwg.org/multipage/scripting.html#the-canvas-element


describe("htmlcanvaselement", () => {
  specify(
    "canvas element is an instance of HTMLElement and HTMLCanvasElement (GH-649)",
    () => {
      const { window } = new JSDOM();
      const canvas = window.document.createElement("canvas");

      assert.strictEqual(canvas instanceof window.HTMLElement, true);
      assert.strictEqual(canvas instanceof window.HTMLCanvasElement, true);
    }
  );

  specify("canvas elements work with getElementById (GH-737)", () => {
    const { window } = new JSDOM("<canvas id='foo'></canvas>");
    const canvas = window.document.getElementById("foo");

    assert.ok(canvas);
  });

  specify("canvas elements width and height must default to 300x150", () => {
    const { window } = new JSDOM();
    const canvas = window.document.createElement("canvas");

    assert.strictEqual(canvas.width, 300);
    assert.strictEqual(canvas.height, 150);

    canvas.width = 400;
    assert.strictEqual(canvas.width, 400);
    assert.strictEqual(canvas.getAttribute("width"), "400");
    canvas.width = "blasdfhdf";
    assert.strictEqual(canvas.width, 0);
    assert.strictEqual(canvas.getAttribute("width"), "0");
    canvas.width = 500;
    assert.strictEqual(canvas.width, 500);
    assert.strictEqual(canvas.getAttribute("width"), "500");
    canvas.width = -1;
    assert.strictEqual(canvas.width, 300);
    assert.strictEqual(canvas.getAttribute("width"), "300");

    canvas.height = 400;
    assert.strictEqual(canvas.height, 400);
    assert.strictEqual(canvas.getAttribute("height"), "400");
    canvas.height = "blasdfhdf";
    assert.strictEqual(canvas.height, 0);
    assert.strictEqual(canvas.getAttribute("height"), "0");
    canvas.height = 500;
    assert.strictEqual(canvas.height, 500);
    assert.strictEqual(canvas.getAttribute("height"), "500");
    canvas.height = -1;
    assert.strictEqual(canvas.height, 150);
    assert.strictEqual(canvas.getAttribute("height"), "150");
  });

  specify(
    "canvas width and height must parse correctly initially (GH-1025)",
    () => {
      const { window } = new JSDOM("<canvas width='99' height='101'></canvas>");
      const canvas = window.document.querySelector("canvas");

      assert.strictEqual(canvas.width, 99);
      assert.strictEqual(canvas.height, 101);
    }
  );

  specify(
    "canvas must resize correctly when given a non-default width/height (GH-1025)",
    t => {
      if (!isCanvasInstalled(assert, t.done)) {
        return;
      }

      const { window } = new JSDOM("<canvas width='400' height='400'></canvas>");
      const canvas = window.document.querySelector("canvas");
      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,255,0,1)";
      ctx.moveTo(50, 50);
      ctx.lineTo(50, 300);
      ctx.lineTo(300, 300);
      ctx.lineTo(300, 50);
      ctx.lineTo(50, 50);
      ctx.stroke();
      ctx.closePath();

      const fullPath = path.resolve(__dirname, "files/expected-canvas.png");
      const expectedPNG = fs.readFileSync(fullPath);
      const expectedImg = PNG.sync.read(expectedPNG);

      const gotDataURL = parseDataURL(canvas.toDataURL());
      const gotPNG = gotDataURL.body;
      const gotImg = PNG.sync.read(gotPNG);

      assert.strictEqual(gotImg.width, expectedImg.width, "width");
      assert.strictEqual(gotImg.height, expectedImg.height, "height");
      assert.strictEqual(Buffer.compare(expectedImg.data, gotImg.data), 0, "byte-level comparison");
      t.done();
    },
    { async: true }
  );

  specify(
    "canvas width and height properties must reflect their attributes after setting them (GH-1281)",
    () => {
      const { window } = new JSDOM("<canvas></canvas>");
      const canvas = window.document.querySelector("canvas");

      canvas.setAttribute("width", 99);
      canvas.setAttribute("height", 101);
      assert.strictEqual(canvas.width, 99);
      assert.strictEqual(canvas.height, 101);
    }
  );

  specify(
    "toDataURL should work (when the canvas npm package is provided) (GH-1025)",
    t => {
      if (!isCanvasInstalled(assert, t.done)) {
        return;
      }

      const { window } = new JSDOM("<canvas width='99' height='101'></canvas>");
      const canvas = window.document.querySelector("canvas");

      assert.strictEqual(canvas.toDataURL().substring(0, 22), "data:image/png;base64,");
      t.done();
    },
    { async: true }
  );

  specify(
    "loading an image and drawing it into the canvas should produce the expected result",
    t => {
      if (!isCanvasInstalled(assert, t.done)) {
        return;
      }

      const { window } = new JSDOM(
        "<canvas width='168' height='168'></canvas>",
        { resources: "usable" }
      );
      const canvas = window.document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const image = new window.Image();
      image.src = "file://" + path.resolve(__dirname, "files/image.png");
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        const expected = fs.readFileSync(path.resolve(__dirname, "files/image.txt"), { encoding: "utf-8" }).trim();
        assert.strictEqual(canvas.toDataURL(), expected);
        canvas.toBlob(blob => {
          assert.strictEqual(blob.type, "image/png");
          assert.strictEqual(blob.size, 2614);
          t.done();
        }, "image/png");
      };
      image.onerror = () => {
        assert.ok(false, "onerror should not be triggered when loading from valid URL");
        t.done();
      };
    },
    { async: true }
  );
});
