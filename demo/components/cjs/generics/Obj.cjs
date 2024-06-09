/**
 * Generates a random number.
 *
 * @returns {number}
 */
module.exports.random = function () {
  return Math.floor(Math.random() * 1000);
};

/**
 * Checks if a value is `null` or `undefined`
 *
 * @param   {unknown} value
 * @returns {boolean}
 */
module.exports.isNil = function (value) {
  return value === undefined || value === null;
};
