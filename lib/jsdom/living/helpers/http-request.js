"use strict";
const http = require("http");
const https = require("https");
const { Writable } = require("stream");
const zlib = require("zlib");

const ver = process.version.replace("v", "").split(".");
const majorNodeVersion = Number.parseInt(ver[0]);

function abortRequest(clientRequest) {
  clientRequest.destroy();
  clientRequest.removeAllListeners();
  clientRequest.on("error", () => {});
}

module.exports = class Request extends Writable {
  constructor(url, options) {
    super();
    this._currentURL = url;
    this._options = options;
    this.headers = this._options.headers;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    this.response = Object.create(null);
    this._performRequest();
  }

  abort() {
    abortRequest(this._currentRequest);
    this.emit("abort");
    this.removeAllListeners();
  }

  write(data, encoding) {
    if (data.length > 0) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding);
    }
  }

  end() {
    this.emit("request", this._currentRequest);
    this._ended = true;
    this._ending = true;
    this._currentRequest.end();
  }

  setHeader(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  }

  removeHeader(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  }

  _performRequest() {
    const urlOptions = new URL(this._currentURL);
    const scheme = urlOptions.protocol;
    this._options.agent = this._options.agents[scheme.substr(0, scheme.length - 1)];
    const self = this;
    function onNative(response) {
      self._processResponse(response);
    }
    const { request } = scheme === "https:" ? https : http;
    const message = request(this._currentURL, this._options, onNative);
    this._currentRequest = message;

    let cookies;
    if (this._redirectCount === 0) {
      this.originalCookieHeader = this.getHeader("Cookie");
    }
    const jar = this._options.cookieJar;
    if (jar) {
      cookies = jar.getCookieStringSync(this._currentURL);
    } else {
      this._areCookiesDisabled = true;
    }
    if (cookies && cookies.length) {
      if (this.originalCookieHeader) {
        this.setHeader("Cookie", this.originalCookieHeader + "; " + cookies);
      } else {
        this.setHeader("Cookie", cookies);
      }
    }

    ["connect", "error", "socket", "timeout"].forEach(event => {
      message.on(event, (...args) => {
        self.emit(event, ...args);
      });
    });
    if (this._isRedirect) {
      let i = 0;
      const buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        if (message === self._currentRequest) {
          if (error) {
            self.emit("error", error);
          } else if (i < buffers.length) {
            const buffer = buffers[i++];
            if (!message.writableEnded) {
              message.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (self._ended) {
            message.end();
          }
        }
      })();
    }
  }

  _processResponse(response) {
    response.request = {};
    response.request.headers = this._options.headers;
    response.request.uri = new URL(this._currentURL);
    this.response = response;

    const jar = this._options.cookieJar;
    const cookies = response.headers["set-cookie"];
    if (!this._areCookiesDisabled && jar && Array.isArray(cookies)) {
      try {
        cookies.forEach(cookie => jar.setCookieSync(cookie, this._currentURL, { ignoreError: true }));
      } catch (e) {
        this.emit("error", e);
      }
    }

    const { statusCode } = response;
    const { location } = response.headers;
    // In Node v15, an aborted message with remaining data causes an error to be thrown
    const catchResErrors = err => {
      if (!(majorNodeVersion === 15 && err.message === "aborted")) {
        this.emit("error", err);
      }
    };
    response.on("error", catchResErrors);
    let redirectAddress = null;
    let resendWithAuth = false;
    if (typeof location === "string" &&
      location.length &&
      this._options.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400) {
      redirectAddress = location;
    } else if (statusCode === 401 &&
      /^Basic /i.test(response.headers["www-authenticate"] || "") &&
      (this._options.user && this._options.user.length)) {
      const { user, pass } = this._options;
      this._options.auth = `${user}:${pass}`;
      resendWithAuth = true;
    }
    if (redirectAddress || resendWithAuth) {
      if (++this._redirectCount > 21) {
        const redirectError = new Error("Maximum number of redirects exceeded");
        redirectError.code = "ERR_TOO_MANY_REDIRECTS";
        this.emit("error", redirectError);
        return;
      }
      abortRequest(this._currentRequest);
      response.destroy();
      this._isRedirect = true;
      if (((statusCode === 301 || statusCode === 302) && this._options.method === "POST") ||
        (statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method))) {
        this._options.method = "GET";
        this._requestBodyBuffers = [];
      }
      let previousHostName = this._removeMatchingHeaders(/^host$/i);
      if (!previousHostName) {
        previousHostName = new URL(this._currentURL).hostname;
      }
      const previousURI = this._currentURL;
      if (!resendWithAuth) {
        const nextURL = redirectAddress.startsWith("https:") ?
          new URL(redirectAddress) :
          new URL(redirectAddress, this._currentURL);
        if (nextURL.hostname !== previousHostName) {
          this._removeMatchingHeaders(/^authorization$/i);
        }
        this._currentURL = nextURL.toString();
      }
      this._options.headers.Referer = previousURI;
      this.response.request.uri = new URL(this._currentURL);
      this.emit("redirect");
      try {
        this._performRequest();
      } catch (cause) {
        this.emit("error", cause);
      }
    } else {
      const isCompressed = this._options.headers["Accept-Encoding"] === "gzip, deflate";
      const self = this;
      function hasBody(code) {
        const isHead = self._options.method === "HEAD";
        const isInformational = code >= 100 && code < 200;
        const hasNoContent = code === 204;
        const isNotModified = code === 304;
        return !(isHead || isInformational || hasNoContent || isNotModified);
      }
      let pipeline = response;
      if (isCompressed && hasBody(statusCode)) {
        const zlibOptions = {
          flush: zlib.constants.Z_SYNC_FLUSH,
          finishFlush: zlib.constants.Z_SYNC_FLUSH
        };
        const contentEncoding = (response.headers["content-encoding"] || "identity").trim().toLowerCase();
        if (contentEncoding === "gzip") {
          pipeline = zlib.createGunzip(zlibOptions);
          pipeline.request = response.request;
          response.pipe(pipeline);
        } else if (contentEncoding === "deflate") {
          pipeline = zlib.createInflate(zlibOptions);
          pipeline.request = response.request;
          response.pipe(pipeline);
        }
      }
      pipeline.removeAllListeners("error");
      this.emit("response", response);
      pipeline.on("data", bytes => this.emit("data", bytes));
      pipeline.once("end", bytes => this.emit("end", bytes));
      pipeline.on("error", catchResErrors);
      pipeline.on("close", () => this.emit("close"));
      this._requestBodyBuffers = [];
    }
  }

  getHeader(key, value) {
    if (this._currentRequest) {
      return this._currentRequest.getHeader(key, value);
    }
    return null;
  }

  _removeMatchingHeaders(regex) {
    const { headers } = this._options;
    let lastValue;
    for (const header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue;
  }
};