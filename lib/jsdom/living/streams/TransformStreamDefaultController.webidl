[Exposed=(Window,Worker,Worklet)]
interface TransformStreamDefaultController {
  readonly attribute unrestricted double? desiredSize;

  void enqueue(optional any chunk);
  void error(optional any reason);
  void terminate();
};
