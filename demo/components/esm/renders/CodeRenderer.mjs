import * as Obj from '../generics/Obj.mjs';
import Renderer from './Renderer.mjs';

/** @typedef {import('./Renderer.mjs').ClassDefinition} ClassDefinition */

/** @extends {Renderer<HTMLElement>} */
export default class CodeRenderer extends Renderer {
  /** @type {HTMLDivElement} */
  #container;

  /**
   * @param {HTMLElement} element
   * @param {ClassDefinition} cls
   * @param {boolean} inner
   */
  constructor(element, cls = null, inner = true) {
    super();

    this.#container = inner ? element.createDiv() : element;
    this.#container.addClasses(this.#cls(cls));
  }

  /** @type {Renderer<HTMLElement>['append']} */
  append(el) {
    this.#container.append(el);
  }

  /**
   * @param   {ClassDefinition} cls
   * @returns {CodeRenderer}
   */
  div(cls) {
    return new CodeRenderer(this.#container, cls);
  }

  /**
   * Append a `label` element.
   *
   * @param {string} id
   * @param {ClassDefinition} cls
   * @returns {CodeRenderer}
   */
  label(id, cls = null) {
    const label = this.#container.createEl('label');
    label.htmlFor = id;
    return new CodeRenderer(label, cls, false);
  }

  /**
   * Append an `input` element.
   *
   * @param {string} type
   * @param {string} name
   * @param {string} id
   * @param {ClassDefinition} cls
   * @returns {HTMLInputElement}
   */
  input(type, name, id, cls = null) {
    const input = this.createEl('input', null, cls);
    input.type = type;
    input.name = name;
    input.id = id;

    this.append(input);
    return input;
  }

  //
  //
  //

  /**
   * Append an element.
   *
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} tag
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @param {string} style
   * @returns {HTMLElementTagNameMap[K]}
   */
  el(tag, content, cls = null, style = null) {
    return super.el(tag, content, cls, style);
  }

  /**
   * Create a detached element.
   *
   * @template {keyof HTMLElementTagNameMap} K
   * @param {K} tag
   * @param {unknown} content
   * @param {ClassDefinition} cls
   * @param {string} style
   * @returns {HTMLElementTagNameMap[K]}
   */
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

  /** @type {Renderer<HTMLIFrameElement>['createIframe']} */
  createIframe(src, cls = null) {
    const iframe = this.createEl('iframe', null, cls);
    iframe.width = '100%';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media; fullscreen';
    iframe.src = src;
    return iframe;
  }

  /** @type {Renderer<HTMLVideoElement>['createVideo']} */
  createVideo(src, withControls = true, cls = null) {
    const video = this.createEl('video', null, cls);
    if (withControls) video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.src = src;
    return video;
  }

  /** @type {Renderer<HTMLVideoElement>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    const image = this.createEl('img', null, cls);
    image.title = title;
    image.src = src;
    image.dataset.src = src;
    return image;
  }

  /** @type {Renderer<HTMLLinkElement>['createLink']} */
  createLink(url, content, cls = null) {
    const link = this.createEl('a', content, cls);
    link.href = url;
    return link;
  }

  /** @type {Renderer<HTMLLinkElement>['createInternalLink']} */
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

  /** @type {Renderer<HTMLIFrameElement>['iframe']} */
  iframe(src, cls = null) {
    return super.iframe(src, cls);
  }

  /** @type {Renderer<HTMLVideoElement>['video']} */
  video(src, withControls = true, cls = null) {
    return super.video(src, withControls, cls);
  }

  /** @type {Renderer<HTMLVideoElement>['image']} */
  image(src, title = 'image', cls = null) {
    return super.image(src, title, cls);
  }

  /** @type {Renderer<HTMLLinkElement>['link']} */
  link(url, content, cls = null) {
    return super.link(url, content, cls);
  }

  /** @type {Renderer<HTMLLinkElement>['ilink']} */
  ilink(resource, content, cls = null) {
    return super.ilink(resource, content, cls);
  }

  /** @type {Renderer<HTMLLinkElement>['clink']} */
  clink(resource, content, cls = null) {
    return super.clink(resource, content, cls);
  }
}
