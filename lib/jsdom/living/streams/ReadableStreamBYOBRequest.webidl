[Exposed=(Window,Worker,Worklet)]
interface ReadableStreamBYOBRequest {
  readonly attribute ArrayBufferView? view;

  void respond([EnforceRange] unsigned long long bytesWritten);
  void respondWithNewView(ArrayBufferView view);
};
