[Exposed=(Window,Worker,Worklet)]
interface ReadableByteStreamController {
  readonly attribute ReadableStreamBYOBRequest? byobRequest;
  readonly attribute unrestricted double? desiredSize;

  void close();
  void enqueue(ArrayBufferView chunk);
  void error(optional any e);
};
