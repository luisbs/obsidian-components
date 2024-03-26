const { onEach, wrap, isNil } = require('./types.cjs');
const Renderer = require('./Renderer.cjs');

module.exports = class CodeRenderer extends Renderer {
  /** @type {HTMLElement[]} */
  #stack = [];

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.#stack.push(root);
  }

  /**
   * @param {any} el
   * @returns {void}
   */
  append(el) {
    this.#stack.last()?.append(el);
  }

  /**
   * @param {string} cls
   * @param {() => void} fn
   */
  div(cls, fn) {
    const div = this.createEl('div', cls);
    this.append(div);

    this.#stack.push(div);
    fn();
    this.#stack.pop();
  }

  /**
   * @param {string} wrapperCls
   * @param {string[]} keys
   * @param {ComponentData} record
   * @param {(key: string, value: unknown) => void} fn
   */
  group(wrapperCls, keys, record, fn) {
    if (!keys.some((key) => !!record[key])) return;

    this.div(wrapperCls, () => {
      for (const key of keys) {
        if (record[key]) fn(key, record[key]);
      }
    });
  }

  /**
   * @param {string} wrapperCls
   * @param {string|(record: ComponentData) => string} innerCls
   * @param {ComponentData[]} records
   * @param {(record: ComponentData) => void} fn
   */
  collection(wrapperCls, innerCls, records, fn) {
    records = wrap(records);

    if (typeof innerCls === 'string') {
      this.div(wrapperCls, () => {
        for (const record of records) {
          this.div(innerCls, fn.bind(null, record));
        }
      });
      return;
    }

    this.div(wrapperCls, () => {
      for (const record of records) {
        this.div(innerCls(record), fn.bind(null, record));
      }
    });
  }

  //
  //
  //

  /**
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} tag
   * @param {unknown} content
   * @param {?string} cls
   * @param {?string} style
   * @returns {HTMLElementTagNameMap[K]}
   */
  createEl(tag = 'span', content, cls = null, style = '') {
    const el = createEl(tag);
    el.style.all = style;

    // classess
    if (typeof cls === 'string') {
      cls.split(/\s+/gi).forEach((cls1) => cls1 && el.addClass(cls1));
    } else if (Array.isArray(cls)) {
      cls.forEach((cls1) => cls1 && el.addClass(cls1));
    } else if (cls) {
      el.addClass(JSON.stringify(cls));
    }

    // content
    if (Array.isArray(content)) {
      el.append(...content);
    } else if (!isNil(content)) {
      el.appendText(JSON.stringify(content));
    }

    return el;
  }

  /**
   * @param {string} src
   * @param {?string} cls
   * @returns {any}
   */
  createIframe(src, cls = null) {
    const iframe = this.createEl('iframe', null, cls);
    iframe.width = '100%';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; fullscreen';
    iframe.src = src;
    return iframe;
  }

  /**
   * @param {string} src
   * @param {?string} title
   * @param {?string} cls
   * @returns {any}
   */
  createImage(src, title = 'image', cls = null) {
    const image = this.createEl('img', null, cls);
    image.title = title;
    image.src = src;
    image.dataset.src = src;
    return image;
  }

  /**
   * @param {string} url
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createLink(url, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.href = url;
    return link;
  }

  /**
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createInternalLink(resource, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.dataset.href = resource;
    link.href = resource;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }
}
