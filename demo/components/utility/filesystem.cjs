/** @type {string} */
const BASE_PATH = app.fileManager.vault.adapter.basePath.replace(/[\\\/]+/ig, '/') + '/';

/**
 * @param {string} path
 * @returns {string}
 */
module.exports.normalizeURI = (path) => {
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
      return BASE_PATH + match.realpath + '?' + match.mtime;
    }
  }

  return '';
};
