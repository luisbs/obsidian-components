const { onEach, wrap, isNil } = require('./types.cjs');
const Renderer = require('./Renderer.cjs');

module.exports = class HtmlRenderer extends Renderer {
  #result = '';

  getHtml() {
    return this.#result;
  }

  /**
   * @param {any} el
   * @returns {void}
   */
  append(el) {
    this.#result += el;
  }

  /**
   * @param {string} cls
   * @param {() => void} fn
   */
  div(cls, fn) {
    this.append(`<div ${this.#cls(cls)}>`);
    fn();
    this.append('</div>');
  };

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
  };

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
   * @param {keyof HTMLElementTagNameMap} tag
   * @param {string|string[]} content
   * @param {?string} cls
   * @param {?string} style
   * @returns {any}
   */
  createEl(tag = 'span', content, cls = null, style = '') {
    return `<${tag} ${this.#cls(cls)} style="${style}">${this.#join(content)}</${tag}>`;
  }

  /**
   * @param {string} src
   * @param {?string} cls
   * @returns {any}
   */
  createIframe(src, cls = null) {
    return `<iframe ${this.#cls(cls)} width="100%" height="80" frameBorder="0" allow="encrypted-media; fullscreen" src="${src}"></iframe>`;
  }

  /**
   * @param {string} src
   * @param {?string} title
   * @param {?string} cls
   * @returns {any}
   */
  createImage(src, title = 'image', cls = null) {
    return `<img ${this.#cls(cls)} title="${title}" src="${src}" />`;
  }

  /**
   * @param {string} url
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createLink(url, content, cls = null) {
    return `<a ${this.#cls(cls)} href="${url}">${this.#join(content)}</a>`;
  }

  /**
   * @param {string} resource
   * @param {unknown} content
   * @param {?string} cls
   * @returns {any}
   */
  createInternalLink(resource, content, cls = null) {
    return `<a ${this.#cls(cls)} data-href="${resource}" href="${resource}" target="_blank" rel="noopener">${content}</a>`;
  }

  #cls(...classess) {
    const valid = [];
    for (const cls of classess) {
      if (typeof cls === 'string') {
        cls.split(/\s+/gi).forEach((cls1) => cls1 && valid.push(cls1));
      } else if (Array.isArray(cls)) {
        cls.forEach((cls1) => cls1 && valid.push(cls1));
      } else if (cls) {
        valid.push(JSON.stringify(cls));
      }
    }
    return valid.length < 1 ? '' : `class="${valid.join(' ')}"`;
  }

  #join(content) {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content.join('');
    }
    return isNil(content) ? '' : JSON.stringify(content);
  }
}
