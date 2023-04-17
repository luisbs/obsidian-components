/**
 * Wraps an object into an array, except if the object is an array.
 *
 * @param  {unknown} obj
 * @return {unknown[]}
 */
module.exports.wrap = (obj) => {
  if (Array.isArray(obj)) return obj;
  return [obj];
};

/**
 * Transforms an object to array.
 * - Splits strings
 *
 * @param {unknown} obj
 * @returns {unknown[]}
 */
module.exports.toArray = (obj) => {
  if (Array.isArray(obj)) return obj;
  if (typeof obj === 'string') return obj.split(/[|;,\s]+/gi);
  return obj === undefined || obj === null ? [] : [obj];
};

/**
 * Call a function on a param that maybe is an array.
 * @param  {unknown} values
 * @param  {(value: unknown, index: number) => void} cb
 * @return {void}
 */
module.exports.callOnArray = (values, cb) => {
  Array.isArray(values) ? values.forEach(cb) : cb(values, 0);
};

/**
 * @param  {unknown[] | Record<'values'|'order', unknown[]>} input
 * @param  {string[]} validColumns
 * @return {{ order: string[]; values: unknown[] }}
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
