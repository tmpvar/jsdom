[Exposed=(Window,Worker,Worklet)]
interface ReadableStreamDefaultController {
  readonly attribute unrestricted double? desiredSize;

  void close();
  void enqueue(optional any chunk);
  void error(optional any e);
};
