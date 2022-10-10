/**
 * @typedef {Object} Attrs
 * @property {string} title
 */

// ? How to export the functionality
// ? out of this file

// * it can be made as an encapsulated file
// * similar to what dataview does
// *
// * in this case the `dv` object and the `attrs` are globals

// const content = dv.el('div')
// content.innerText = attrs.title

// * it can be made as an library file
// * exporting a main function
// *
// * for this idea cjs can be used
// * that wil allow the final user:
// * - to have typehint with @jsdocs
// * - use other files as compilers for inner parts

/**
 * @param {Attrs} attrs
 */
module.exports = function (attrs) {
  return require('./book.md')
}
