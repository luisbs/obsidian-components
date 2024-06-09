import { Obj } from '../generics/index.js';
import Renderer from './Renderer.js';

/** @typedef {import("../../types").ClassResolver} ClassResolver */
/**
 * @template T
 * @typedef {import("../../types").IRenderer<T>} IRenderer
 */

/** @extends {Renderer<HTMLElement>} */
export default class CodeRenderer extends Renderer {
  /** @type {HTMLDivElement} */
  #container;

  /**
   * @param {HTMLElement} parent
   * @param {ClassResolver} cls
   */
  constructor(parent, cls) {
    super();
    this.#container = parent.createDiv();
    this.#container.addClasses(this.#cls(cls));
  }

  /** @type {IRenderer<HTMLElement>['append']} */
  append(el) {
    this.#container.append(el);
  }

  /**
   * @param   {ClassResolver} cls
   * @returns {CodeRenderer}
   */
  div(cls) {
    return new CodeRenderer(this.#container, cls);
  }

  //
  //
  //

  /** @type {IRenderer<HTMLElement>['createEl']} */
  createEl(tag = 'span', content, cls = null, style = '') {
    const el = createEl(tag);
    el.addClasses(this.#cls(cls));
    el.style.all = style;

    // content
    if (Obj.isNil(content)) return el;

    if (Array.isArray(content)) el.append(...content);
    else el.append(content);

    return el;
  }

  /** @type {IRenderer<HTMLElement>['createIframe']} */
  createIframe(src, cls = null) {
    const iframe = this.createEl('iframe', null, cls);
    iframe.width = '100%';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; fullscreen';
    iframe.src = src;
    return iframe;
  }

  /** @type {IRenderer<HTMLElement>['createVideo']} */
  createVideo(src, cls = null) {
    const video = this.createEl('video', null, cls);
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.src = src;
    return video;
  }

  /** @type {IRenderer<HTMLElement>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    const image = this.createEl('img', null, cls);
    image.title = title;
    image.src = src;
    image.dataset.src = src;
    return image;
  }

  /** @type {IRenderer<HTMLElement>['createLink']} */
  createLink(url, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.href = url;
    return link;
  }

  /** @type {IRenderer<HTMLElement>['createInternalLink']} */
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
}
