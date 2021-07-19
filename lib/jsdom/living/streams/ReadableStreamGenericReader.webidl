interface mixin ReadableStreamGenericReader {
  readonly attribute Promise<void> closed;

  Promise<void> cancel(optional any reason);
};
