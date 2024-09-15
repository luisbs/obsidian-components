const INTERNAL_BOTH_REGEX = () => /^\!?\[\[|\]\]$/gi;
const INTERNAL_START_REGEX = () => /^\!?\[\[/gi;

const EXTERNAL_BOTH_REGEX = () => /^\!?\[|\)$/gi;
const EXTERNAL_START_REGEX = () => /^\!?\[/gi;
const EXTERNAL_MIDDLE_REGEX = () => /\]\(/gi;

const URL_PARAMS_REGEX = () => /[\?\&]/gi;

const PATH_REGEX = () => /[\\\/]/gi;
const PARAMS_LABEL_REGEX = () => /^(label|title|name|l|t)/gi;
const PARAMS_SIZE_REGEX = () => /^(size|width|s|w)/gi;

const VIDEO_REGEX = () => /mp4|webm|ogg/gi;

/**
 * @param {string[]} params
 * @returns {string | undefined}
 */
module.exports.getParamsLabel = function (params) {
  if (params.length === 1 && !params[0].includes('=')) {
    return params[0];
  }

  for (let param of params) {
    if (PARAMS_SIZE_REGEX().test(param)) continue;
    if (PARAMS_LABEL_REGEX().test(param)) {
      return param.split('=').pop();
    }
  }
};

/**
 * @param {string[]} params
 * @returns {string | undefined}
 */
module.exports.getParamsSize = function (params) {
  if (params.length === 1 && !params[0].includes('=') && PARAMS_SIZE_REGEX().test(params[0])) {
    return params[0].replace(PARAMS_SIZE_REGEX(), '');
  }

  for (const param of params) {
    if (PARAMS_SIZE_REGEX().test(param)) {
      return !param.includes('=') //
        ? param.replace(PARAMS_SIZE_REGEX(), '')
        : param.split('=').pop();
    }
  }
};

/**
 * @param {string} url
 * @returns {string}
 */
module.exports.getURLDomain = function (url) {
  const levels = url
    .replace(/^https?:\/\//gi, '')
    .split('/')
    .first()
    .split('.');
  return levels[levels.length - 2] + '.' + levels[levels.length - 1];
};

/**
 * @param {string} path
 * @returns {string | undefined}
 */
module.exports.getURIExtension = function (path) {
  const filename = path.split(PATH_REGEX()).pop() || '';
  return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : undefined;
};

// /** @typedef {import('../typings/globals.js').URIMetadata} URIMetadata */
/**
 * @param {string} uri
 * @returns {URIMetadata?}
 */
module.exports.getURIMetadata = function (uri) {
  if (typeof uri !== 'string') return null;
  uri = uri.trim();

  if (!uri) return null;

  /** @type {URIMetadata['type']} */
  let mode = 'unknown';
  let _ = '';
  let path = '';
  let label = undefined;
  let params = [];

  // internal URI
  // ej: ![[image.png|label]]
  if (INTERNAL_START_REGEX().test(uri)) {
    mode = 'internal';
    [path, ...params] = uri.replace(INTERNAL_BOTH_REGEX(), '').split('|');
    label = params.length < 1 ? path.replace('#', ' > ') : getParamsLabel(params);
  }

  // external URI
  // ej: ![label](https://dominio.com/ruta/de/image.png?params)
  else if (EXTERNAL_START_REGEX().test(uri)) {
    let params0 = '',
      params1 = [],
      params2 = [];
    [params0, path] = uri.replace(EXTERNAL_BOTH_REGEX(), '').split(EXTERNAL_MIDDLE_REGEX());
    [_, ...params2] = path.split(URL_PARAMS_REGEX());

    if (params0.includes('|')) {
      [label, ...params1] = params0.split('|');
    } else {
      params1 = [params0];
    }

    mode = 'external';
    params = [...params1, ...params2];
    label = label || getParamsLabel(params);
  }

  // URL
  // ej: https://dominio.com/ruta/de/image.png#label?params
  else if (uri.startsWith('http')) {
    mode = 'url';
    [path, ...params] = uri.split(URL_PARAMS_REGEX());
    label = path.contains('#') ? path.split('#')[1] : getParamsLabel(params);
    path = uri;
  }

  const ext = getURIExtension(path);
  return {
    mode,
    path,
    ext,
    label,
    params,

    isVideo: () => VIDEO_REGEX().test(ext),
    getSize: () => getParamsSize(params),
    hasLabel: () => !!label,
    getLabel: () => label || path.split(PATH_REGEX()).pop(),
    getSrc: (notepath) => normalizeURI(path, notepath),
  };
};

/** @typedef {{ type: 'folder', realpath: string }} VaultFolder */
/** @typedef {{ type: 'file', realpath: string, size: number, ctime: number, mtime: number }} VaultFile */

/**
 * @param {string} path
 * @param {string} notepath
 * @returns {Promise<string>}
 */
module.exports.normalizeURI = function (path, notepath = 'utility/') {
  if (typeof path !== 'string') return '';
  if (path.startsWith('http')) return path;

  /** @type {Record<string, VaultFile | VaultFolder>} */
  const files = app.fileManager.vault.adapter.files;

  for (const filepath in files) {
    if (
      Object.hasOwnProperty.call(files, filepath) && //
      files[filepath].type === 'file' && //
      filepath.includes(path)
    ) {
      const match = files[filepath];
      // console.log({ BASE_PATH, path, match })
      // return BASE_PATH + match.realpath + '?' + match.mtime;
      return app.vault.adapter.getResourcePath(match.realpath);
    }
  }

  return '';
};

/**
 * Stripe url params.
 *
 * @param   {string} url
 * @returns {string}
 */
module.exports.strip = function (url) {
  return typeof url === 'string' ? url.replace(/\?.*/gi, '') : '';
};
