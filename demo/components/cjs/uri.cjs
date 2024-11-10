module.exports = class URI {
  /** @type {(path: string) => string} */
  static #normalize(path) {
    if (typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;

    /** @type {Record<string, { type: 'folder' | 'file', realpath: string }>} */
    const files = app.fileManager.vault.adapter.files;
    for (const filepath in files) {
      if (files[filepath].type !== 'file' || !filepath.includes(path)) continue;
      return app.vault.adapter.getResourcePath(files[filepath].realpath);
    }

    return '';
  }

  //#region URI params

  static #isSize = (param) => /^(size|width|s|w)/gi.test(param);
  static #isLabel = (param) => /^(label|title|l|t)/gi.test(param);

  static #rmSize = (param) => param.replace(/^(size|width|s|w)=?/gi, '');
  static #rmLabel = (param) => param.replace(/^(label|title|l|t)=?/gi, '');

  /** @type {(params: string[]) => string | undefined} */
  static #getSize(params) {
    if (params.length < 1) return undefined;
    if (params.length === 1 && this.#isSize(params[0])) return this.#rmSize(params[0]);
    for (const param of params) if (this.#isSize(param)) return this.#rmSize(param);
  }

  /** @type {(params: string[]) => string | undefined} */
  static #getLabel(params) {
    if (params.length < 1) return undefined;
    if (params.length === 1 && !this.#isSize(params[0])) return this.#rmLabel(params[0]);
    for (const param of params) if (this.#isLabel(param)) return this.#rmLabel(param);
  }

  //#endregion URI params

  /** @type {(url: string) => string} */
  static #getURLDomain = (url) => url.replace(/^https?:\/\//gi, '').split('/')[0];

  /** @type {(path_tail: string) => string | undefined} */
  static #getExt(path_tail) {
    const filename = path_tail.replace(/[#?].*$/gi, '');
    return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : undefined;
  }

  /** @type {(value: string) => Pick<URIMetadata, 'type' | 'uri' | 'params'> | undefined} */
  static #parseURL(value) {
    if (!/^https?:\/\//gi.test(value)) return;
    // good: https://example.net/image.png#id?label&param2=value2
    const [_, ...params] = value.split(/[?&]+/gi);
    return { type: 'url', uri: value, params };
  }

  /** @type {(value: string) => Pick<URIMetadata, 'type' | 'uri' | 'params'> | undefined} */
  static #parseMarkdown(value) {
    if (!/^\!?\[/gi.test(value)) return;
    // good: ![label](https://example.net/image.png#id?param2=value2)
    const [label, uri] = value.replace(/^\!?\[|\)$/gi, '').split(/\]\(/gi);
    const [_, ...params] = value.split(/[?&]+/gi);
    params.unshift(label);
    return { type: 'md', uri, params };
  }

  /** @type {(value: string) => Pick<URIMetadata, 'type' | 'uri' | 'params'> | undefined} */
  static #parseVault(value) {
    if (!/^\!?\[\[/gi.test(value)) return;
    // err : ![[image.png#id?param2=value2|label]]
    // err : ![[image.png#id|label&param2=value2]]
    // bad : ![[image.png#id|label|param2=value2]]
    // good: ![[image.png#id|label]]
    const [uri, ...params] = value.replace(/^\!?\[\[|\]\]$/gi, '').split('|');
    return { type: 'vault', uri, params };
  }

  /** @type {(value: string) => URIMetadata?} */
  static getMetadata(value) {
    if (typeof value !== 'string') return null;
    value = value.trim();

    if (!value) return null;
    const meta = this.#parseURL(value) || this.#parseVault(value) || this.#parseMarkdown(value);
    if (!meta) return null;

    //
    const { type, uri, params } = meta;
    const clean = uri.replace(/\?.*$/gi, '');
    const path_tail = !/[/\\]/.test(clean) ? clean : clean.match(/(?<=[/\\])[^/\\]+$/gi)[0] || '';
    const ext = this.#getExt(path_tail);

    return {
      type,
      uri,
      params,

      ext,
      isVideo: /mp4|webm|ogg/gi.test(ext),

      src: this.#normalize(uri) || '',
      size: this.#getSize(params) || '1',
      label: this.#getLabel(params) || path_tail.replace('#', ' > '),
    };
  }
};
