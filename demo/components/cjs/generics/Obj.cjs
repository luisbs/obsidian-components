/**
 * Generates a random number.
 *
 * @returns {number}
 */
module.exports.random = function () {
  return Math.floor(Math.random() * 1e7);
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

/**
 * Check if an object includes and is `truety` any of the passed fields.
 * @param   {unknown} obj
 * @param   {unknown[]} fields
 * @returns {boolean}
 */
module.exports.includes = function (obj, ...fields) {
  if (typeof obj !== 'object' || isNil(obj)) return false;

  for (const field of fields) {
    if (Array.isArray(field) && field.some((f) => !!obj[f])) return true;
    if (typeof field === 'string' && !!obj[field]) return true;
  }

  return false;
};

/**
 * Iterate over the `truety` values of an object.
 *
 * @param   {unknown} obj
 * @param   {unknown[]} fields
 * @returns {Iterable<[string, unknown]>}
 */
module.exports.flattenEntries = function* (obj, ...fields) {
  if (typeof obj !== 'object' || isNil(obj)) return;

  /** @type {string[]} */
  const filtered = fields
    .flat() //
    .filter((field) => typeof field === 'string' && obj[field]);

  for (const field of filtered) {
    if (Array.isArray(obj[field])) {
      for (const value of obj[field]) {
        yield [(field, value)];
      }
    } else {
      yield [(field, obj[field])];
    }
  }
};
