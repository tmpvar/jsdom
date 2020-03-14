# JSDOM Karma Server API

In order to run Web Platform Tests in the browser, it's necessary to use a server process, this is done using an [express](https://expressjs.com/)-based server, which is started by [karma-child-process](https://www.npmjs.com/package/karma-child-process).

The server supports additional headers prefixed with `X-JSDOM-`.

## Paths:

### `/start-wpt-server`

Starts the Web Platform Tests server.

| Query parameter | Type      | Description
| --------------- | --------- | -----------
| `to-upstream`   | `boolean` | Whether to run tests in `to-upstream` instead of in `tests`.

The response includes the following debug headers:

| Response Header           | Description
| ---------------           | -----------
| `X-JSDOM-WPT-Directory`   | The name of the directory in which the tests will be run.
