export type ClassResolver = string | string[]; //| (() => string | string[]);

export interface IRenderer<T> {
  /** Append an element. */
  append(el: T): void;

  /** Creates and appends a `div` element. */
  div(cls: ClassResolver): IRenderer<T>;

  //
  //
  //

  /** Create a detached element. */
  createEl(
    tag: keyof HTMLElementTagNameMap,
    content: unknown,
    cls: string | null = null,
    style: string | null = null
  ): T;
  /** Create a detached `iframe` element. */
  createIframe(src: string, cls: string | null = null): T;
  /** Create a detached `video` element. */
  createVideo(src: string, cls: string | null = null): T;
  /** Create a detached `image` element. */
  createImage(src: string, title: string | null = 'image', cls: string | null = null): T;
  /** Create a detached `link` element. */
  createLink(url: string, content: unknown, cls: string | null = null): T;
  /** Create a detached internal `link`. */
  createInternalLink(resource: string, content: unknown, cls: string | null = null): T;
  /** Create a detached `code` element inside an internal `link`. */
  createCodeLink(resource: string, content: unknown, cls: string | null = null): T;

  //
  //
  //

  /** Append an element. */
  el(
    tag: keyof HTMLElementTagNameMap,
    content: unknown,
    cls: string | null = null,
    style: string | null = null
  ): T;

  /** Append an `iframe` element. */
  iframe(src: string, cls: string | null = null): T;

  /** Append a `video` element. */
  video(src: string, cls: string | null = null): T;

  /** Append an `image` element. */
  image(src: string, title: string | null = 'image', cls: string | null = null): T;

  /** Append a `link` element. */
  link(url: string, content: unknown, cls: string | null = null): T;

  /** Append an internal `link`. */
  ilink(resource: string, content: unknown, cls: string | null = null): T;

  /** Append a `code` element inside an internal `link`. */
  clink(resource: string, content: unknown, cls: string | null = null): T;
}

export interface IRendererOld<T, C> {
  /** Append an element. */
  append(el: T): void;

  /** Appends a `div` element and calls the `fn` param to fill the `div`. */
  div(cls: string, fn: () => void): void;

  /** Appends a `div` element containing the specified key-values from a record. */
  group(
    wrapperCls: string,
    keys: string[],
    record: C,
    fn: (key: string, value: unknown) => void
  ): void;

  /** Appends a `div` element containing `div` elements for each record. */
  collection(
    wrapperCls: string,
    innerCls: string | string[] | ((record: C) => string | string[]),
    records: C[],
    fn: (record: C) => void
  ): void;

  //
  //
  //

  /** Create an element. */
  createEl(
    tag: string,
    content: unknown,
    cls: string | null = null,
    style: string | null = null
  ): T;

  /** Create an `iframe` element. */
  createIframe(src: string, cls: string | null = null): T;

  /** Create an `video` element. */
  createVideo(src: string, cls: string | null = null): T;

  /** Create an `image` element. */
  createImage(src: string, title: string | null = 'image', cls: string | null = null): T;

  /** Create a `link` element. */
  createLink(url: string, content: unknown, cls: string | null = null): T;

  /** Create an internal `link`. */
  createInternalLink(resource: string, content: unknown, cls: string | null = null): T;

  /** Create a `code` element inside an internal `link`. */
  createCodeLink(resource: string, content: unknown, cls: string | null = null): T;

  //
  //
  //

  /** Append an element. */
  el(
    tag: keyof HTMLElementTagNameMap,
    content: unknown,
    cls: string | null = null,
    style: string | null = null
  ): void;

  /** Append an `iframe` element. */
  iframe(src: string, cls: string | null = null): void;

  /** Append a `video` element. */
  video(src: string, cls: string | null = null): void;

  /** Append an `image` element. */
  image(src: string, title: string | null = 'image', cls: string | null = null): void;

  /** Append a `link` element. */
  link(url: string, content: unknown, cls: string | null = null): void;

  /** Append an internal `link`. */
  ilink(resource: string, content: unknown, cls: string | null = null): void;

  /** Append a `code` element inside an internal `link`. */
  clink(resource: string, content: unknown, cls: string | null = null): void;
}
