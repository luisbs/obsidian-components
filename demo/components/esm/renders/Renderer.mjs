/**
 * // @typedef {string | string[]; //| (() => string | string[])} ClassDefinition
 * @typedef {string | string[]} ClassDefinition
 */

/** @template T */
export default class Renderer {
  /**
   * Append an element.
   *
   * @param {T} el
   * @returns {void}
   */
  append(el) {
    throw Error('Not implemented');
  }

  /**
   * Creates and appends a `div` element.
   *
   * @param {ClassDefinition} cls
   * @returns {Renderer<T>}
   */
  div(cls) {
    throw Error('Not implemented');
  }

  //
  //
  //

  /**
   * Create a detached element.
   *
   * @param {keyof HTMLElementTagNameMap} tag
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @param {string} style
   * @returns {T}
   */
  createEl(tag, content, cls = null, style = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached `iframe` element.
   *
   * @param {string} src
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createIframe(src, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached `video` element.
   *
   * @param {string} src
   * @param {boolean} withControls
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createVideo(src, withControls = true, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached `image` element.
   *
   * @param {string} src
   * @param {string} title
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createImage(src, title = 'image', cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached `link` element.
   *
   * @param {string} url
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createLink(url, content, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createInternalLink(resource, content, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a detached `code` element inside an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  createCodeLink(resource, content, cls = null) {
    return this.createInternalLink(resource, this.createEl('code', content, cls), 'internal-link');
  }

  //
  //
  //

  /**
   * Append an element.
   *
   * @param {keyof HTMLElementTagNameMap} tag
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @param {string} style
   * @returns {T}
   */
  el(tag, content, cls = null, style = null) {
    const el = this.createEl(tag, content, cls, style);
    this.append(el);
    return el;
  }

  /**
   * Append an `iframe` element.
   *
   * @param {string} src
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  iframe(src, cls = null) {
    const el = this.createIframe(src, cls);
    this.append(el);
    return el;
  }

  /**
   * Append a `video` element.
   *
   * @param {string} src
   * @param {boolean} withControls
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  video(src, withControls = true, cls = null) {
    const el = this.createVideo(src, withControls, cls);
    this.append(el);
    return el;
  }

  /**
   * Append an `image` element.
   *
   * @param {string} src
   * @param {string} title
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  image(src, title = 'image', cls = null) {
    const el = this.createImage(src, title, cls);
    this.append(el);
    return el;
  }

  /**
   * Append a `link` element.
   *
   * @param {string} url
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  link(url, content, cls = null) {
    const el = this.createLink(url, content, cls);
    this.append(el);
    return el;
  }

  /**
   * Append an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  ilink(resource, content, cls = null) {
    const el = this.createInternalLink(resource, content, cls);
    this.append(el);
    return el;
  }

  /**
   * Append a `code` element inside an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @returns {T}
   */
  clink(resource, content, cls = null) {
    const el = this.createCodeLink(resource, content, cls);
    this.append(el);
    return el;
  }
}
