const INTERNAL_BOTH_REGEX = () => /^\!?\[\[|\]\]$/gi;
const INTERNAL_START_REGEX = () => /^\!?\[\[/gi;
const INTERNAL_PARAMS_REGEX = () => /\|/gi;

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
 * @param {string?} path
 * @returns {string | undefined}
 */
export function getParamsLabel(params, path) {
  if (params.length === 1 && !params[0].includes('=')) {
    return params[0];
  }

  for (let param of params) {
    if (PARAMS_SIZE_REGEX().test(param)) continue;
    if (PARAMS_LABEL_REGEX().test(param)) {
      return param.split('=').pop();
    }
  }

  if (path) {
    return path.split(PATH_REGEX()).pop();
  }
}

/**
 * @param {string[]} params
 * @returns {string | undefined}
 */
export function getParamsSize(params) {
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
}

/**
 * @param {string} url
 * @returns {string | undefined}
 */
export function getURLDomain(url) {
  const levels = url
    .replace(/^https?:\/\//gi, '')
    .split('/')
    .first()
    .split('.');
  return levels[levels.length - 2] + '.' + levels[levels.length - 1];
}

/**
 * @param {string} path
 * @returns {string | undefined}
 */
export function getURIExtension(path) {
  const filename = path.split(PATH_REGEX()).pop() || '';
  return filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : undefined;
}

/**
 * @param {string} uri
 * @returns {URIMetadata?}
 */
export function getURIMetadata(uri) {
  if (typeof uri !== 'string') return null;
  uri = uri.trim();

  if (!uri) return null;

  /** @type {URIMetadata['type']} */
  let mode = 'unknown';
  let path = '';
  let label = '';
  let params = [];

  // internal URI
  // ej: ![[image.png|label]]
  if (INTERNAL_START_REGEX().test(uri)) {
    mode = 'internal';
    [path, ...params] = uri.replace(INTERNAL_BOTH_REGEX(), '').split(INTERNAL_PARAMS_REGEX());
    label = params.length < 1 ? path.replace('#', ' > ') : getParamsLabel(params, path) || '';
  }

  // external URI
  // ej: ![label](https://dominio.com/ruta/de/image.png?params)
  else if (EXTERNAL_START_REGEX().test(uri)) {
    const [p1, p2] = uri.replace(EXTERNAL_BOTH_REGEX(), '').split(EXTERNAL_MIDDLE_REGEX());
    let params1 = [],
      params2 = [];
    [path, ...params2] = p2.split(URL_PARAMS_REGEX());

    if (p1.includes('|')) {
      [label, ...params1] = p1.split(INTERNAL_PARAMS_REGEX());
    } else {
      params1 = p1.split(INTERNAL_PARAMS_REGEX());
    }

    mode = 'external';
    label = label || getParamsLabel(params, path) || '';
    params = [...params1, ...params2];
  }

  // URL
  // ej: https://dominio.com/ruta/de/image.png?params
  else if (uri.startsWith('http')) {
    mode = 'url';
    [path, ...params] = uri.split(URL_PARAMS_REGEX());
    label = getParamsLabel(params, path) || '';
  }

  const ext = getURIExtension(path);
  return {
    mode,
    path,
    ext,
    label,
    params,

    isVideo: () => VIDEO_REGEX().test(ext),
    getSrc: () => normalizeURI(path),
    getSize: getParamsSize.bind(null, params),
  };
}

/**
 * @param {string} path
 * @returns {string}
 */
export function normalizeURI(path) {
  if (typeof path !== 'string') return '';

  if (path.startsWith('http')) {
    return path;
  }

  /** @type {VaultFiles} */
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
}

/**
 * Stripe url params.
 *
 * @param   {string} url
 * @returns {string}
 */
export function strip(url) {
  return typeof url === 'string' ? url.replace(/\?.*/gi, '') : '';
}
