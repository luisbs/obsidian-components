// * commonjs can be used
// * that wil allow the final user:
// * - to have typehint with @jsdocs
// * - use other files as library files and import/export with `require`

const { join } = require('./lib.cjs');

/**
 * @param {HTMLElement} container
 * @param {Record<string, unknown>} data
 */
module.exports = function (container, data) {
  data = Array.isArray(data) ? data : [data];

  const ul = container.createEl('ul');
  data.forEach((dt) => {
    ul.createEl('li', undefined, (p) => {
      p.append(`The author ${dt.author} wrote "${dt.title}"`);
    });
  });
};
