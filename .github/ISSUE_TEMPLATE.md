### Basic info:

- **Node.js version:** <!-- only v12 and above are supported -->
- **jsdom version:** <!-- only v16 and above are supported -->

### Minimal reproduction case

```js
const { JSDOM } = require("jsdom");

const options = {
  ... your options here ...
};
const dom = new JSDOM(`
  ... your HTML here ...
`, options);

... your code that reproduces the problem here, probably using dom.window ...
```

<!--
Please create a minimal repro. Any reports involving third party libraries
will be closed, as we cannot debug third-party library interactions for you.

Please do not use syntax that is not supported in Node.js, such as JSX or
`import` statements. If we cannot run the code in Node.js, we will close the
issue, as we cannot debug whatever toolchain you are using.
-->

### How does similar code behave in browsers?

(Link to a jsbin or similar strongly suggested.)
