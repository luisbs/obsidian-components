const { isNil } = require('./Obj.cjs');

/**
 * Splits strings with `|;,\s`
 *
 * @param   {unknown} value
 * @returns {string[]}
 */
module.exports.split = function (value) {
  if (typeof value === 'string') return value.split(/[|;,\s]+/gi);
  return Array.isArray(value) ? value : [];
};

/**
 * String values are returned directly
 * and stringifies non-string values.
 *
 * @param   {unknown} value
 * @returns {string}
 */
module.exports.stringify = function (value) {
  if (typeof value === 'string') return value;
  return isNil(value) ? '' : JSON.stringify(value);
};
