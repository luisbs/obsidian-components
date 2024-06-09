/**
 * @template T
 * @typedef {import("../../types").IRenderer<T>} IRenderer
 */

/**
 * @template T
 * @type {IRenderer<T>}
 */
export default class Renderer {
  /** @type {IRenderer<T>['append']} */
  append(el) {
    throw Error('Not implemented');
  }

  /** @type {IRenderer<T>['div']} */
  div(cls) {
    throw Error('Not implemented');
  }

  //
  //
  //

  /** @type {IRenderer<T>['createEl']} */
  createEl(tag, content, cls = null, style = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createIframe']} */
  createIframe(src, cls = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createVideo']} */
  createVideo(src, cls = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createLink']} */
  createLink(url, content, cls = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createInternalLink']} */
  createInternalLink(resource, content, cls = null) {
    throw Error('Not implemented');
  }
  /** @type {IRenderer<T>['createCodeLink']} */
  createCodeLink(resource, content, cls = null) {
    return this.createInternalLink(resource, this.createEl('code', content, cls), 'internal-link');
  }

  //
  //
  //

  /** @type {IRenderer<T>['el']} */
  el(tag, content, cls = null, style = null) {
    const el = this.createEl(tag, content, cls, style);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['iframe']} */
  iframe(src, cls = null) {
    const el = this.createIframe(src, cls);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['video']} */
  video(src, cls = null) {
    const el = this.createVideo(src, cls);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['image']} */
  image(src, title = 'image', cls = null) {
    const el = this.createImage(src, title, cls);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['link']} */
  link(url, content, cls = null) {
    const el = this.createLink(url, content, cls);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['ilink']} */
  ilink(resource, content, cls = null) {
    const el = this.createInternalLink(resource, content, cls);
    this.append(el);
    return el;
  }
  /** @type {IRenderer<T>['clink']} */
  clink(resource, content, cls = null) {
    const el = this.createCodeLink(resource, content, cls);
    this.append(el);
    return el;
  }
}
