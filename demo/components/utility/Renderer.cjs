module.exports = class Renderer {
  /**
   * Append an element.
   *
   * @param {keyof HTMLElementTagNameMap} tag
   * @param {unknown} content
   * @param {?string} cls
   * @param {?string} style
   * @returns {void}
   */
  el(tag, content, cls = null, style = null) {
    this.append(this.createEl(tag, content, cls, style));
  }

  /**
   * Append an `iframe` element.
   *
   * @param {string} src
   * @param {?string} cls
   */
  iframe(src, cls = null) {
    this.append(this.createIframe(src, cls));
  }

  /**
   * Append an `image` element.
   *
   * @param {string} src
   * @param {?string} title
   * @param {?string} cls
   */
  image(src, title = 'image', cls = null) {
    this.append(this.createImage(src, title, cls));
  }

  /**
   * Append a `link` element.
   *
   * @param {string} url
   * @param {unknown} content
   * @param {?string} cls
   */
  link(url, content, cls = null) {
    this.append(this.createLink(url, content, cls));
  }

  /**
   * Append an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {void}
   */
  ilink(resource, content, cls = null) {
    this.append(this.createInternalLink(resource, content, cls));
  }

  /**
   * Append a `code` element inside an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {void}
   */
  clink(resource, content, cls = null) {
    this.append(this.createCodeLink(resource, content, cls));
  }

  //
  //
  //

  /**
   * Append an element.
   *
   * @param {any} el
   * @returns {void}
   */
  append(el) {
    throw Error('Not implemented');
  }

  /**
   * Appends a `div` element and calls the `fn` param to fill the `div`.
   *
   * @param {string} cls
   * @param {() => void} fn
   */
  div(cls, fn) {
    throw Error('Not implemented');
  }

  /**
   * Appends a `div` element containing the specified key-values from a record.
   *
   * @param {string} wrapperCls
   * @param {string[]} keys
   * @param {ComponentData} record
   * @param {(key: string, value: unknown) => void} fn
   */
  group(wrapperCls, keys, record, fn) {
    throw Error('Not implemented');
  }

  /**
   * Appends a `div` element containing `div` elements for each record.
   *
   * @param {string} wrapperCls
   * @param {string|(record: ComponentData) => string} innerCls
   * @param {ComponentData[]} records
   * @param {(record: ComponentData) => void} fn
   */
  collection(wrapperCls, innerCls, records, fn) {
    throw Error('Not implemented');
  }

  //
  //
  //

  /**
   * @param {string} tag
   * @param {unknown} content
   * @param {?string} cls
   * @param {?string} style
   * @returns {any}
   */
  createEl(tag, content, cls = null, style = null) {
    throw Error('Not implemented');
  }

  /**
   * Create an `iframe` element.
   *
   * @param {string} src
   * @param {?string} cls
   * @returns {any}
   */
  createIframe(src, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create an `image` element.
   *
   * @param {string} src
   * @param {?string} title
   * @param {?string} cls
   * @returns {any}
   */
  createImage(src, title = 'image', cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a `link` element.
   *
   * @param {string} url
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createLink(url, content, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createInternalLink(resource, content, cls = null) {
    throw Error('Not implemented');
  }

  /**
   * Create a `code` element inside an internal `link`.
   *
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createCodeLink(resource, content, cls = null) {
    return this.createInternalLink(resource, this.createEl('code', content, cls), 'internal-link');
  }
}
