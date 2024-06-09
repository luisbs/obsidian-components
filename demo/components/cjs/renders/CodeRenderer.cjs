const { Obj } = require('../generics/index.cjs');
const Renderer = require('./Renderer.cjs');

/**
 * @template T
 * @typedef {import("../../types").IRendererOld<T>} IRendererOld
 */

/** @type {IRendererOld<HTMLElement>} */
module.exports = class CodeRenderer extends Renderer {
  /** @type {HTMLElement[]} */
  #stack = [];

  /** @return {HTMLElement} */
  getStack() {
    return this.#stack.last();
  }

  constructor(root) {
    super();
    this.#stack.push(root);
  }

  /** @type {IRendererOld<HTMLElement>['append']} */
  append(el) {
    this.#stack.last()?.append(el);
  }

  /** @type {IRendererOld<HTMLElement>['div']} */
  div(cls, fn) {
    const div = this.createEl('div', null, cls);
    this.append(div);

    this.#stack.push(div);
    fn();
    this.#stack.pop();
  }

  //
  //
  //

  /** @type {IRendererOld<HTMLElement>['createEl']} */
  createEl(tag = 'span', content, cls = null, style = '') {
    const el = createEl(tag);
    el.addClasses(this.#cls(cls));
    el.style.all = style;

    // content
    if (Array.isArray(content)) {
      el.append(...content);
    } else if (typeof content === 'string') {
      el.appendText(content);
    } else if (!Obj.isNil(content)) {
      el.append(content);
    }

    return el;
  }

  /** @type {IRendererOld<HTMLElement>['createIframe']} */
  createIframe(src, cls = null) {
    const iframe = this.createEl('iframe', null, cls);
    iframe.width = '100%';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; fullscreen';
    iframe.src = src;
    return iframe;
  }

  /** @type {IRendererOld<HTMLElement>['createVideo']} */
  createVideo(src, cls = null) {
    const video = this.createEl('video', null, cls);
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.src = src;
    return video;
  }

  /** @type {IRendererOld<HTMLElement>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    const image = this.createEl('img', null, cls);
    image.title = title;
    image.src = src;
    image.dataset.src = src;
    return image;
  }

  /** @type {IRendererOld<HTMLElement>['createLink']} */
  createLink(url, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.href = url;
    return link;
  }

  /** @type {IRendererOld<HTMLElement>['createInternalLink']} */
  createInternalLink(resource, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.dataset.href = resource;
    link.href = resource;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }

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
    return valid;
  }
};
