[Exposed=(Window,Worker,Worklet)]
interface ReadableStreamDefaultReader {
  constructor(ReadableStream stream);

  Promise<ReadableStreamDefaultReadResult> read();
  void releaseLock();
};
ReadableStreamDefaultReader includes ReadableStreamGenericReader;
