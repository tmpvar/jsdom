"use strict";
const { assert } = require("chai");
const { describe, it } = require("mocha-sugar-free");

const { JSDOM } = require("../..");

describe("JSDOM CSS handling, basic setting and retrieving ", () => {
	
	const options = {
	url: "http://localhost/",
			referrer: "http://aggressive.se",
			contentType: "text/html",
			userAgent: "AggressiveDev",
			includeNodeLocations: false,
			resources: "usable",		
			pretendToBeVisual: true,
			runScripts: "dangerously",
	};
	const dom = new JSDOM(`<body></body>`, options);
	var window = dom.window
	var document = window.document;
	
	var styleSheet = document.createElement("style");
	styleSheet.setAttribute('type', 'text/css');
	styleSheet.setAttribute("media", "only screen and (min-width : 512px)");
	
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(styleSheet);
	
	//then we must fetch the actual node
	styleSheet = document.styleSheets[document.styleSheets.length - 1];
	
	
	it("should have css-nodes with attributes (for media queries, href, etc)", () => {
		
		assert.equal(head.innerHTML, "<style type=\"text/css\" media=\"only screen and (min-width : 512px)\"></style>");
	});

	it("CSS nodes should have cssText, and prefixes", () => {

		styleSheet.insertRule(".workingClass {  dontAddThis }", 0);
		var rule = styleSheet.cssRules[0];
		rule.style.borderColor = "green";
		
		assert.equal(rule.cssText, ".workingClass { border-color: green; }", "style nodes getting styled");
		
		//and prefixes should work
		rule.style.webkitBorderRadius = "5px";
		assert.equal(rule.cssText, ".workingClass { -webkit-border-radius: 5px; }");
	});
	
	it("CSS-animation nodes are tricker, but should also work", () => {

		var idx = styleSheet.insertRule('@keyframes animationTeam {}', styleSheet.cssRules.length);
		var animation = styleSheet.cssRules[idx];
		
		//creating a keyframe rule: CSSKeyframesRule
		assert.equal(animation.constructor.name, "CSSKeyframesRule", "Keyframe css nodes is: CSSKeyframesRule");
		
		var cssRule = "{ '100%': { opacity: 0 } }";
		
		assert(animation.insertRule, "CSSKeyframesRule should be able to have rules, missing insertRule-function")
		animation.insertRule(cssRule);
		
		//and then something like this, if you ever get to it...
		assert.equal(animation.cssText, "@keyframes animationTeam { '100%': { opacity: 0 } }");
	});
});
