/**
 * @param {string[]} paths
 */
module.exports.join = function (...paths) {
  return paths.join(' - ')
}
