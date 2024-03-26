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
  const p  = container.createEl('p')
  p.appendText(`The author ${data.author}`)
  p.appendText(` allways has been popular`)
  p.appendText(` for his/her book named "${data.title}"`)

  container.createEl('p').setText(join(data.author, data.title))
}
