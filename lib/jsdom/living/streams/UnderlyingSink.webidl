dictionary UnderlyingSink {
  UnderlyingSinkStartCallback start;
  UnderlyingSinkWriteCallback write;
  UnderlyingSinkCloseCallback close;
  UnderlyingSinkAbortCallback abort;
  any type;
};

callback UnderlyingSinkStartCallback = any (WritableStreamDefaultController controller);
callback UnderlyingSinkWriteCallback = Promise<void> (any chunk, WritableStreamDefaultController controller);
callback UnderlyingSinkCloseCallback = Promise<void> ();
callback UnderlyingSinkAbortCallback = Promise<void> (optional any reason);
