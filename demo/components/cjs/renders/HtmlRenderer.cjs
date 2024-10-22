const { isNil } = require('../generics/Obj.cjs');
const Renderer = require('./Renderer.cjs');

/** @typedef {import('./Renderer.js').ClassDefinition} ClassDefinition */

/** @extends {Renderer<string>} */
module.exports = class HtmlRenderer extends Renderer {
  /** @type {string} */
  #classess = '';
  /** @type {Array<HtmlRenderer | string>} */
  #children = [];

  /** @returns {string} */
  getHtml() {
    const content = this.#children.map((e) => (e instanceof HtmlRenderer ? e.getHtml() : e));
    return `<div ${this.#classess}>${content.join('')}</div>`;
  }

  /** @param {ClassDefinition} cls */
  constructor(cls) {
    super();
    this.#classess = this.#cls(cls);
  }

  /** @type {Renderer<string>['append']} */
  append(el) {
    this.#children.push(el);
  }

  /**
   * @param {ClassDefinition} cls
   * @returns {HtmlRenderer}
   */
  div(cls) {
    const child = new HtmlRenderer(cls);
    this.#children.push(child);
    return child;
  }

  //
  //
  //

  /** @type {Renderer<string>['createEl']} */
  createEl(tag = 'span', content, cls = null, style = '') {
    style = typeof style === 'string' ? `style="${style}"` : '';
    return `<${tag} ${this.#cls(cls)} ${style}>${this.#join(content)}</${tag}>`;
  }

  /** @type {Renderer<string>['createIframe']} */
  createIframe(src, cls = null) {
    // prettier-ignore
    return `<iframe ${this.#cls(cls)} width="100%" height="80" frameBorder="0" allow="encrypted-media; fullscreen" src="${src}"></iframe>`;
  }

  /** @type {Renderer<string>['createVideo']} */
  createVideo(src, withControls = true, cls = null) {
    const params = withControls ? 'controls' : '';
    return `<video ${this.#cls(cls)} src="${src}" ${params} autoplay loop></video>`;
  }

  /** @type {Renderer<string>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    return `<img ${this.#cls(cls)} title="${title}" src="${src}" />`;
  }

  /** @type {Renderer<string>['createLink']} */
  createLink(url, content, cls = null) {
    return `<a ${this.#cls(cls)} href="${url}">${this.#join(content)}</a>`;
  }

  /** @type {Renderer<string>['createInternalLink']} */
  createInternalLink(resource, content, cls = null) {
    // prettier-ignore
    return `<a ${this.#cls(cls)} data-href="${resource}" href="${resource}" target="_blank" rel="noopener">${content}</a>`;
  }

  //
  //
  //

  /** @returns {string} */
  #cls(...classess) {
    const valid = [];
    for (const cls of classess) {
      if (Array.isArray(cls)) {
        cls.forEach((c) => typeof c === 'string' && c && valid.push(c));
      } else if (typeof cls === 'string') {
        cls.split(/\s+/gi).forEach((c) => c && valid.push(c));
      }
    }
    return valid.length < 1 ? '' : `class="${valid.join(' ')}"`;
  }

  #join(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.join('');
    return isNil(content) ? '' : JSON.stringify(content);
  }
};
