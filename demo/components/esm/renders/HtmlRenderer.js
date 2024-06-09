import { Obj } from '../generics/index.js';
import Renderer from './Renderer.js';

/** @typedef {import("../../types").ClassResolver} ClassResolver */
/**
 * @template T
 * @typedef {import("../../types").IRenderer<T>} IRenderer
 */

/** @extends {Renderer<string>} */
export default class HtmlRenderer extends Renderer {
  /** @type {string} */
  #classess = '';
  /** @type {Array<HtmlRenderer | string>} */
  #children = [];

  /** @returns {string} */
  getHtml() {
    const content = this.#children.map((e) => (e instanceof HtmlRenderer ? e.getHtml() : e));
    return `<div ${this.#classess}>${content.join('')}</div>`;
  }

  /** @param {ClassResolver} cls */
  constructor(cls) {
    super();
    this.#classess = this.#cls(cls);
  }

  /** @type {IRenderer<string>['append']} */
  append(el) {
    this.#children.push(el);
  }

  /**
   * @param   {ClassResolver} cls
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

  /** @type {IRenderer<string>['createEl']} */
  createEl(tag = 'span', content, cls = null, style = '') {
    style = typeof style === 'string' ? `style="${style}"` : '';
    return `<${tag} ${this.#cls(cls)} ${style}>${this.#join(content)}</${tag}>`;
  }

  /** @type {IRenderer<string>['createIframe']} */
  createIframe(src, cls = null) {
    // prettier-ignore
    return `<iframe ${this.#cls(cls)} width="100%" height="80" frameBorder="0" allow="encrypted-media; fullscreen" src="${src}"></iframe>`;
  }

  /** @type {IRenderer<string>['createVideo']} */
  createVideo(src, cls = null) {
    return `<video ${this.#cls(cls)} src="${src}" controls autoplay loop></video>`;
  }

  /** @type {IRenderer<string>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    return `<img ${this.#cls(cls)} title="${title}" src="${src}" />`;
  }

  /** @type {IRenderer<string>['createLink']} */
  createLink(url, content, cls = null) {
    return `<a ${this.#cls(cls)} href="${url}">${this.#join(content)}</a>`;
  }

  /** @type {IRenderer<string>['createInternalLink']} */
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
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content.join('');
    }
    return Obj.isNil(content) ? '' : JSON.stringify(content);
  }
}
