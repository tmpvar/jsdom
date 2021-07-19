dictionary UnderlyingSource {
  UnderlyingSourceStartCallback start;
  UnderlyingSourcePullCallback pull;
  UnderlyingSourceCancelCallback cancel;
  ReadableStreamType type;
  [EnforceRange] unsigned long long autoAllocateChunkSize;
};

typedef (ReadableStreamDefaultController or ReadableByteStreamController) ReadableStreamController;

callback UnderlyingSourceStartCallback = any (ReadableStreamController controller);
callback UnderlyingSourcePullCallback = Promise<void> (ReadableStreamController controller);
callback UnderlyingSourceCancelCallback = Promise<void> (optional any reason);

enum ReadableStreamType { "bytes" };
