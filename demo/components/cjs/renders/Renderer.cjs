/**
 * @template T
 * @typedef {import("../../types").IRendererOld<T>} IRendererOld
 */

/**
 * @template T
 * @type {IRendererOld<T>}
 */
module.exports = class Renderer {
  /** @type {IRendererOld<T>['append']} */
  append(el) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['div']} */
  div(cls, fn) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['group']} */
  group(wrapperCls, keys, record, fn) {
    if (!keys.some((key) => !!record[key])) return;

    this.div(wrapperCls, () => {
      for (const key of keys) {
        if (record[key]) fn(key, record[key]);
      }
    });
  }

  /** @type {IRendererOld<T>['collection']} */
  collection(wrapperCls, innerCls, records, fn) {
    records = Arr.wrap(records);

    if (typeof innerCls === 'string') {
      this.div(wrapperCls, () => {
        for (const record of records) {
          this.div(innerCls, () => fn(record));
        }
      });
      return;
    }

    this.div(wrapperCls, () => {
      for (const record of records) {
        this.div(innerCls(record), () => fn(record));
      }
    });
  }

  //
  //
  //

  /** @type {IRendererOld<T>['createEl']} */
  createEl(tag, content, cls = null, style = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createIframe']} */
  createIframe(src, cls = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createVideo']} */
  createVideo(src, cls = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createImage']} */
  createImage(src, title = 'image', cls = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createLink']} */
  createLink(url, content, cls = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createInternalLink']} */
  createInternalLink(resource, content, cls = null) {
    throw Error('Not implemented');
  }

  /** @type {IRendererOld<T>['createCodeLink']} */
  createCodeLink(resource, content, cls = null) {
    return this.createInternalLink(resource, this.createEl('code', content, cls), 'internal-link');
  }

  //
  //
  //

  /** @type {IRendererOld<T>['el']} */
  el(tag, content, cls = null, style = null) {
    this.append(this.createEl(tag, content, cls, style));
  }

  /** @type {IRendererOld<T>['iframe']} */
  iframe(src, cls = null) {
    this.append(this.createIframe(src, cls));
  }

  /** @type {IRendererOld<T>['video']} */
  video(src, cls = null) {
    this.append(this.createVideo(src, cls));
  }

  /** @type {IRendererOld<T>['image']} */
  image(src, title = 'image', cls = null) {
    this.append(this.createImage(src, title, cls));
  }

  /** @type {IRendererOld<T>['link']} */
  link(url, content, cls = null) {
    this.append(this.createLink(url, content, cls));
  }

  /** @type {IRendererOld<T>['ilink']} */
  ilink(resource, content, cls = null) {
    this.append(this.createInternalLink(resource, content, cls));
  }

  /** @type {IRendererOld<T>['clink']} */
  clink(resource, content, cls = null) {
    this.append(this.createCodeLink(resource, content, cls));
  }
};
