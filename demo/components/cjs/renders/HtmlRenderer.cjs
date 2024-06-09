const { Arr, Obj } = require('../generics/index.cjs');
const Renderer = require('./Renderer.cjs');

/**
 * @template T
 * @typedef {import("../../types").IRendererOld<T>} IRendererOld
 */

/** @type {IRendererOld<string>} */
module.exports = class HtmlRenderer extends Renderer {
  #result = '';

  /** @returns {string} */
  getHtml() {
    return this.#result;
  }

  /** @type {IRendererOld<string>['append']} */
  append(el) {
    this.#result += el;
  }

  /** @type {IRendererOld<string>['div']} */
  div(cls, fn) {
    this.append(`<div ${this.#cls(cls)}>`);
    fn();
    this.append('</div>');
  }

  //
  //
  //

  /** @type {IRendererOld<string>['createEl']} */
  createEl(tag = 'span', content, cls = null, style = '') {
    style = typeof style === 'string' ? `style="${style}"` : '';
    return `<${tag} ${this.#cls(cls)} ${style}>${this.#join(content)}</${tag}>`;
  }

  /** @type {IRendererOld<string>['createIframe']} */
  createIframe(src, cls = null) {
    // prettier-ignore
    return `<iframe ${this.#cls(cls)} width="100%" height="80" frameBorder="0" allow="encrypted-media; fullscreen" src="${src}"></iframe>`;
  }

  /** @type {IRendererOld<string>['createVideo']} */
  createVideo(src, cls = null) {
    return `<video ${this.#cls(cls)} src="${src}" controls autoplay loop></video>`;
  }

  /** @type {IRendererOld<string>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    return `<img ${this.#cls(cls)} title="${title}" src="${src}" />`;
  }

  /** @type {IRendererOld<string>['createLink']} */
  createLink(url, content, cls = null) {
    return `<a ${this.#cls(cls)} href="${url}">${this.#join(content)}</a>`;
  }

  /** @type {IRendererOld<string>['createInternalLink']} */
  createInternalLink(resource, content, cls = null) {
    // prettier-ignore
    return `<a ${this.#cls(cls)} data-href="${resource}" href="${resource}" target="_blank" rel="noopener">${content}</a>`;
  }

  //
  //
  //

  /** @returns {string[]} */
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
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.join('');
    }

    return Obj.isNil(content) ? '' : JSON.stringify(content);
  }
};
