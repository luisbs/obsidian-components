// * commonjs can be used
// * that wil allow the final user:
// * - to have typehint with @jsdocs
// * - use other files as library files and import/export with `require`

const {join} = require('./lib.cjs')

/**
 * @param {HTMLElement} container
 * @param {Record<string, unknown>} data
 */
module.exports = function (container, data) {
  const ul = container.createEl('ul')
  for (const [key, value] of Object.entries(data)) {
    ul.createEl('li', { text: join(key, value) })
  }
}
