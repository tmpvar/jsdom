[Exposed=(Window,Worker,Worklet)]
interface WritableStreamDefaultWriter {
  constructor(WritableStream stream);

  readonly attribute Promise<void> closed;
  readonly attribute unrestricted double? desiredSize;
  readonly attribute Promise<void> ready;

  Promise<void> abort(optional any reason);
  Promise<void> close();
  void releaseLock();
  Promise<void> write(optional any chunk);
};
