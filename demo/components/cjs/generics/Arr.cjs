const { isNil } = require('./Obj.cjs');

/**
 * Ensure a variable is an array.
 *
 * @template T
 * @param   {T} value
 * @returns {T extends Array ? T : T[]}
 */
module.exports.wrap = function (value) {
    if (Array.isArray(value)) return value;
    return isNil(value) ? [] : [value];
};
