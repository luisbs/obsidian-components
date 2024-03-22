/**
 * Checks if an object is `null` or `undefined`
 *
 * @param   {unknown} obj
 * @returns {boolean}
 */
const isNil = (obj) => (obj === undefined || obj === null);
module.exports.isNil = isNil;

/**
 * @param   {unknown} obj
 * @returns {string}
 */
module.exports.stringify = (obj) => {
  if (typeof obj === 'string') return obj;
  return obj ? JSON.stringify(obj) : '';
}

/**
 * Wraps an object into an array, if the object is an array.
*
* @param   {unknown} obj
* @returns {unknown[]}
*/
module.exports.wrap = (obj) => {
  if (Array.isArray(obj)) return obj;
  return isNil(obj) ? [] : [obj];
};

/**
 * Splits strings with `|;,\s`
 *
 * @param   {unknown} obj
 * @returns {unknown[]}
 */
module.exports.split = (obj) => {
  if (Array.isArray(obj)) return obj;
  return (typeof obj !== 'string') ? [] : obj.split(/[|;,\s]+/gi);
};

/**
 * Call a function on a param that maybe an array.
 *
 * @param   {unknown} obj
 * @param   {(value: unknown, index: number) => void} fn
 * @returns {void}
 */
module.exports.onEach = (obj, fn) => {
  if (!Array.isArray(obj)) {
    fn(obj, 0);
    return;
  }

  for (let i = 0; i < obj.length; i++) {
    if (obj[i]) fn(obj[i], i);
  }
};

/**
 * @param   {unknown[] | Record<'values'|'order', unknown[]>} input
 * @param   {string[]} validColumns
 * @returns {{ order: string[]; values: unknown[] }}
 */
module.exports.serializeInputForTable = (input, validColumns) => {
  const params = { order: validColumns, values: [] };
  if (Array.isArray(input)) params.values = input;
  if (input && typeof input === 'object') {
    if (Array.isArray(input.values)) params.values = input.values;
    if (Array.isArray(input.order)) params.order = input.order;
  }
  return params;
};
