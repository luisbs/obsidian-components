export type ClassResolver = string | string[]; //| (() => string | string[]);

export interface IRenderer<T> {
  /** Append an element. */
  append(el: T): void;

  /** Creates and appends a `div` element. */
  div(cls: ClassResolver): IRenderer<T>;

  /** Create a detached element. */
  createEl(tag: keyof HTMLElementTagNameMap, content: unknown, cls?: string, style?: string): T;
  /** Create a detached `iframe` element. */
  createIframe(src: string, cls?: string): T;
  /** Create a detached `video` element. */
  createVideo(src: string, cls?: string): T;
  /** Create a detached `image` element. */
  createImage(src: string, title?: string, cls?: string): T;
  /** Create a detached `link` element. */
  createLink(url: string, content: unknown, cls?: string): T;
  /** Create a detached internal `link`. */
  createInternalLink(resource: string, content: unknown, cls?: string): T;
  /** Create a detached `code` element inside an internal `link`. */
  createCodeLink(resource: string, content: unknown, cls?: string): T;

  /** Append an element. */
  el(tag: keyof HTMLElementTagNameMap, content: unknown, cls?: string, style?: string): T;
  /** Append an `iframe` element. */
  iframe(src: string, cls?: string): T;
  /** Append a `video` element. */
  video(src: string, cls?: string): T;
  /** Append an `image` element. */
  image(src: string, title?: string, cls?: string): T;
  /** Append a `link` element. */
  link(url: string, content: unknown, cls?: string): T;
  /** Append an internal `link`. */
  ilink(resource: string, content: unknown, cls?: string): T;
  /** Append a `code` element inside an internal `link`. */
  clink(resource: string, content: unknown, cls?: string): T;
}
