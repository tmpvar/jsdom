[Exposed=(Window,Worker,Worklet)]
interface WritableStream {
  constructor(optional object underlyingSink, optional QueuingStrategy strategy = {});

  readonly attribute boolean locked;

  Promise<void> abort(optional any reason);
  Promise<void> close();
  WritableStreamDefaultWriter getWriter();
};
